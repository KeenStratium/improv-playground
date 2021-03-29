import { PrismaClient } from "@prisma/client"
import { ApolloServer, AuthenticationError } from 'apollo-server'
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
    comments:      [Comment]
  }

  type Comment {
    id:            Int
    content:       String
    user:          User
    createdAt:     String
    state:         Int
    reactionCount: JSON
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
    cityId:        Int
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
    signUp(
      username: String! 
      password: String!
      emailAddress: String
      birthdate: String!
      firstName: String
      lastName: String
      isAnonymous: Boolean!
    ): AuthPayload
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
          city: true,
          mediaUpload: true,
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
        throw new AuthenticationError('Invalid account credentials, please try again.');
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: account.userId
        }
      })

      if (!user) {
        throw new Error('User info not found.')
      }

      const token = jwt.sign({ userId: user.id }, jwtSecret)

      return {
        user: user,
        token: token
      }
    },
    signUp: async (parent: any, args: any, ctx: any, info: any) => {
      let displayName = null

      if (args.isAnonymous) {
        displayName = args.username
      } else {
        displayName = `${args.firstName} ${args.lastName}`
      }

      const account = await prisma.account.create({
        data: {
          username: args.username,
          password: await bcrypt.hash(args.password, 10),
          emailAddress: args.emailAddress,
          type: 'Citizen',
          status: 1,
          user: {
            create: {
              firstName: 'firstName' in args ? args.firstName : null,
              lastName: 'lastName' in args ? args.lastName : null,
              displayName: displayName,
              isAnonymous: args.isAnonymous,
              birthdate: args.birthdate,
              cityId: 1
            }
          }
        }
      })

      if (!account) {
        throw new Error('Something went wrong creating account, please try again.')
      }

      const user = await prisma.user.findUnique({
        where: {
          id: account.userId!
        }
      })

      if (!user) {
        throw new Error('Something went wrong creating user info, please try again.')
      }

      const token = jwt.sign({ userId: user.id }, jwtSecret)

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
    const refreshToken = req.headers["x-refresh-token"];
    const accessToken = req.headers["x-access-token"];

    if (!accessToken && !refreshToken) return { prisma };

    const user = getAuthenticatedUser(token)

    if (!user) {
      throw new AuthenticationError('You must be logged in to perform this action.');
    }

    return {
      prisma
    }
  }
});

function getAuthenticatedUser(token: String) {
  if (token == '') {
    console.log('no token');
  }

  return null
}


server.listen({ port: 4000 }).then((url) => {
  console.log(`🚀  Server ready at port ${url.port}`);

  dotenv.config();
});