import { PrismaClient } from "@prisma/client"
import { ApolloServer } from 'apollo-server'

const prisma = new PrismaClient();

const typeDefs = `#graphql
  input ProfileCreateInput {
    name: String
  }

  input UserCreateInput {
    karmaPoints: Int
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
    reactionCount: String
    mediaUpload:   MediaUpload
    postAnalytic:  [PostAnalytic]    
    viewCount:     Int
    "Returns a report type such as 'Lighting Issues', 'Road Development Work', etc..." 
    type:          String
    city:          City
    comment:       [Comment]
  }

  type Comment {
    id:            Int
    content:       String
    user:          User
    createdAt:     String
    state:         Int
    reactionCount: String
    mediaUpload:   MediaUpload
    Post:          Post
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

  # type Mutation {
  #   createProfile(
  #     userId: Int
  #     name: String
  #   ): Profile!
    
  #   createUser(
  #     karmaPoints: Int
  #     profile: ProfileCreateInput
  #   ): User!
  # }

  type Query {
    allUsers: [User!]!,
    allPosts: [Post!]!
  }`;


const resolvers = {
  Query: {
    allPosts: () => {
      return prisma.post.findMany({});
    },
    allUsers: () => {
      return prisma.user.findMany({});
    }
  },
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