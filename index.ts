import { PrismaClient } from "@prisma/client"
import { ApolloServer, AuthenticationError, makeExecutableSchema } from 'apollo-server'
import { rule, shield, and, or, not } from 'graphql-shield'
import { GraphQLJSON } from 'graphql-scalars'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
const bcrypt = require('bcryptjs');
const jwtSecret: string = process.env.APP_SECRET!
import { applyMiddleware } from "graphql-middleware";

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
    account:       Account
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
    refreshToken(
      userId: Int!
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
    refreshToken: String!
  }
`;


function generateAccessToken(user: any, account: any) {
  return jwt.sign({
    user: {
      userId: user.id,
      role: account.type,
    }
  },
    jwtSecret, {
    'expiresIn': '30m'
  })
}

function generateRefreshToken(accessToken: String, user: any) {
  const tokenParts = accessToken.split('.')

  return jwt.sign({
    accessTokenTrail: tokenParts[tokenParts.length - 1],
    user: {
      userId: user.id,
    }
  },
    jwtSecret, {
    'expiresIn': '7d'
  })
}

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

      const token = generateAccessToken(user, account)
      const refreshToken = generateRefreshToken(token, user)

      return {
        user,
        token,
        refreshToken
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

      const token = generateAccessToken(user, account)
      const refreshToken = generateRefreshToken(token, user)

      return {
        user,
        token,
        refreshToken
      }
    },
    refreshToken: async (parent: any, args: any, ctx: any, info: any) => {
      const isVerified = verifyRefreshToken(ctx.refreshToken, args.userId, ctx.accessToken)

      if (isVerified) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: args.userId
          },
          include: {
            account: true
          }
        })
        const token = generateAccessToken(user, user.account)
        const refreshToken = generateRefreshToken(token, user)

        return {
          user: user,
          token: token,
          refreshToken: refreshToken
        }
      } else {
        return new AuthenticationError('Refresh token expired. Please login again.')
      }
    }
  }
};

const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return ctx.user !== null && ctx.user !== undefined && !ctx.isExpired
  },
)

const isCitizen = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return ctx.user.role === 'Citizen'
  },
)

const isModerator = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return ctx.user.role === 'Moderator'
  },
)

const hasRefreshToken = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return ctx.refreshToken !== null && ctx.refreshToken !== undefined
  },
)

const isTokenExpired = rule({ cache: 'contextual' })(
  async (parent, args, ctx, info) => {
    return ctx.refreshToken !== undefined && ctx.isExpired
  },
)

const permissions = shield({
  Query: {
    allPosts: and(isAuthenticated, isCitizen),
    allUsers: isAuthenticated,
    options: isAuthenticated,
    user: isAuthenticated,
    post: isAuthenticated
  },
  Mutation: {
    userLogin: not(isAuthenticated),
    signUp: not(isAuthenticated),
    createPost: isAuthenticated,
    createComment: isAuthenticated,
    refreshToken: and(hasRefreshToken, isTokenExpired, not(isAuthenticated))
  },
})

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs,
    resolvers
  }),
  permissions
)

const server = new ApolloServer({
  schema: schema,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    const refreshToken = req.headers["x-refresh-token"];
    const decoded: any = decodeToken(token) || {}
    let ctx: any = { prisma }
    let decodedToken = null;

    if ('err' in decoded && decoded['err'] !== null && decoded['err'] !== undefined) {
      const tokenStatus: Number = getTokenStatus(decoded['err'])

      if (tokenStatus === 1) {
        ctx['isExpired'] = true
      }
    } else if (decoded['decoded'] !== undefined) {
      decodedToken = decoded['decoded']
    }

    const user = getAuthenticatedUser(decodedToken)

    if (refreshToken !== undefined) {
      ctx['refreshToken'] = refreshToken
      ctx['accessToken'] = decoded['token']
    }

    if (user) {
      ctx['user'] = user
      ctx['isExpired'] = false
    }

    return ctx
  }
});

function getTokenStatus(err: any): Number {
  if (err) {
    const errName = err['name']

    if (errName == 'TokenExpiredError') {
      return 1
    }
  }

  return 0
}

function getAuthenticatedUser(decoded: any) {
  if (decoded !== undefined && decoded !== null && 'user' in decoded) {
    const user = decoded['user']

    return user
  }

  return null
}

function decodeToken(tokenStr: String) {
  if (tokenStr == '') {
    return null;
  }
  const tokenArr = tokenStr.split(' ')

  if (tokenArr.length > 1 && tokenArr[0].toLowerCase() === 'bearer') {
    const token = tokenArr[1]

    return jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      return { err, decoded, token }
    })
  }

  return null
}

function verifyRefreshToken(token: any, userId: any, accessToken: any): any {
  return jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err === undefined) {
      const errName = err['name']

      if (errName == 'TokenExpiredError') {
        return false
      }
    } else {
      const user = decoded['user']

      if (decoded !== undefined && user !== undefined) {
        if (user['userId'] !== undefined && user['userId'] !== null) {
          const tokenUserId = user['userId']
          const accessTokenTrail = decoded['accessTokenTrail']
          const tokenParts = accessToken.split('.')

          if (tokenParts.length === 3) {
            return tokenUserId === userId && tokenParts[2] === accessTokenTrail
          }
        }
      }

      return false
    }

    return false
  })
}

server.listen({ port: 4000 }).then((url) => {
  console.log(`🚀  Server ready at port ${url.port}`);

  dotenv.config();
});