import { PrismaClient } from "@prisma/client"
import { ApolloServer } from 'apollo-server'
import { GraphQLJSON } from 'graphql-scalars'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
const bcrypt = require('bcryptjs');
const jwtSecret: string = process.env.APP_SECRET!

const prisma = new PrismaClient();

const typeDefs = `#graphql
  scalar JSON

  type City {
    id:         Int
    postMeta:   [PostMeta]
    name:       String
    createdAt:  String
    User:       [User]
    favByUsers: [User]
  }

  type PostMeta {
    id:           Int    
    post:         Post
  }

  type Post {
    id:            Int
    content:       String
    title:         String
    user:          User
    userId:        Int
    createdAt:     String
    """
    One of the f.f.:
    - '-1: archived'
    - '1: active'
    - '0: draft'
    """
    state:         Int    
    reference:     Post
    referencedBy:  [Post]  
    reactionCount: JSON
    mediaUpload:   MediaUpload
    postAnalytic:  [PostAnalytic]    
    viewCount:     Int
    "Returns a report type such as 'Lighting Issues', 'Road Development Work', etc..." 
    type:          ValueMeta
    city:          City
    cityId:        Int
    comments:      [Comment]
  }

  type Comment {
    id:            Int
    content:       String
    user:          User
    createdAt:     String
    state:         Int
    reactionCount: String
    mediaUpload:   MediaUpload
    post:          Post
    parentComment: Comment
    childComments: [Comment]
  }

  type User {
    id:            Int
    createdAt:     String
    posts:         [Post]
    postAnalytic:  [PostAnalytic]
    avatarUrl:     String
    defaultCity:   City
    firstName:     String
    lastName:      String
    birthdate:     String
    isAnonymous:   Boolean
    displayName:   String
  }

  type MediaUpload {
    id:             Int
    postId: Int
    post:   Post
    mediaUrls:      [String]
    "no usage yet - TBA"
    metadata:       String
  }

  type PostAnalytic {
    id:             Int
    type:           String
    post:           Post
    postId:         Int
    value:          String
    user:           User
    userId:         Int
  }

  type ValueMeta {
    id:        String
    value:     String
  }

  type Account {
    username: String
    password: String
    emailAddress: String
    """
    One of the f.f.:
    - 'Moderator'
    - 'Citizen'
    """
    type: String
    """
    One of the f.f.:
    - -1: Suspended
    - 0: Archive
    - 1: Active
    """
    status: Int
    user: User
  }

  type Mutation {
    createPost(
      userId: Int
      title: String!
      content: String!
      cityId: Int!
      type: String
    ) : Post!
    createComment(
      content: String!
      userId: Int!
      postId: Int
      commentId: Int
    ): Comment!
    userLogin(
      username: String!
      password: String!
    ): AuthPayload!
  }

  type Query {
    allUsers: [User!]!
    allPosts: [Post!]!
    options: [ValueMeta!]!
    user(id: Int!): User!
    post(id: Int!): Post
    account(username: String!): Account
  }

  type AuthPayload {
    user: User
    token: String!
  }
`;


const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    allPosts: () => {
      return prisma.post.findMany({
        include: {
          user: true,
          type: true,
          comments: {
            include: {
              childComments: {
                include: {
                  childComments: true
                }
              }
            }
          }
        }
      });
    },
    allUsers: () => {
      return prisma.user.findMany({});
    },
    options: () => {
      return prisma.valueMeta.findMany({})
    },
    user: (parent: any, args: any, ctx: any, info: any) => {
      return prisma.user.findUnique({
        where: {
          id: args.id
        }
      })
    },
    post: (parent: any, args: any, ctx: any, info: any) => {
      return prisma.post.findUnique({
        where: {
          id: args.id
        }
      })
    }
  },
  Mutation: {
    createPost: (parent: any, args: any, ctx: any, info: any) => {
      return ctx.prisma.post.create({
        data: {
          user: {
            connect: {
              id: args.userId
            }
          },
          title: args.title,
          content: args.content,
          state: 1,
          reactionCount: {
            like: 0
          },
          type: {
            connect: {
              id: args.type
            }
          },
          city: {
            connect: {
              id: args.cityId
            }
          },
        }
      })
    },
    createComment: (parent: any, args: any, ctx: any, info: any) => {
      let data = {}

      if ('postId' in args) {
        data = {
          user: {
            connect: {
              id: args.userId
            }
          },
          content: args.content,
          state: 1,
          reactionCount: {
            like: 0
          },
          post: {
            connect: {
              id: args.postId
            }
          },
        }
      } else if ('commentId') {
        data = {
          user: {
            connect: {
              id: args.userId
            }
          },
          content: args.content,
          state: 1,
          reactionCount: {
            like: 0
          },
          parentComment: {
            connect: {
              id: 'commentId' in args ? args.commentId : undefined
            }
          }
        }
      }

      return ctx.prisma.comment.create({
        data
      })
    },
    userLogin: async (parent: any, args: any, ctx: any, info: any) => {
      const account = await ctx.prisma.account.findUnique({
        where: {
          username: args.username
        }
      })

      if (!account) {
        throw new Error('Account not found, please try again.')
      }

      const valid = await bcrypt.compare(args.password, account.password)

      if (!valid) {
        throw new Error('Invalid account credentials, please try again.')
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: account.userId
        }
      })

      if (!user) {
        throw new Error('User info not found.')
      }

      const token = jwt.sign({ userId: account.id }, jwtSecret)

      return {
        user: user,
        token: token
      }
    }
  }
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
  context: ({ req }) => {
    const token = req.headers.authorization || '';

    console.log('token', token);

    return {
      prisma
    }
  }
});


server.listen({ port: 4000 }).then((url) => {
  console.log(`🚀  Server ready at port ${url.port}`);

  dotenv.config();
});