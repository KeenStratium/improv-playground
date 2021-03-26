import { PrismaClient } from "@prisma/client"
import { ApolloServer } from 'apollo-server'
import { GraphQLJSON } from 'graphql-scalars';

const prisma = new PrismaClient();

const typeDefs = `#graphql
  scalar JSON

  input ProfileCreateInput {
    name: String
  }

  input UserCreateInput {
    karmaPoints: Int
  }

  input PostCreateInput {
    userId: Int,
    title: String!,
    content: String!,
    cityId: Int!,
    type: String
  }

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
    "Either 'Post' or 'Comment'"
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

  type Mutation {
    # createProfile(
    #   userId: Int
    #   name: String
    # ): Profile!
    
    # createUser(
    #   karmaPoints: Int
    #   profile: ProfileCreateInput
    # ): User!

    createPost(
      userId: Int,
      title: String!,
      content: String!,
      cityId: Int!,
      type: String
    ) : Post!
    createComment(
      content: String!,
      userId: Int!,
      postId: Int,
      commentId: Int
    ): Comment!
  }

  type Query {
    allUsers: [User!]!,
    allPosts: [Post!]!,
    options: [ValueMeta!]!
  }

  type AuthPayload {
    hello: String!
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
    }
  }
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
  context: {
    prisma
  }
});


server.listen({ port: 4000 }).then((url) => {
  console.log(`🚀  Server ready at port ${url.port}`);
});