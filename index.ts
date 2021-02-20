import { PrismaClient } from "@prisma/client"
import { ApolloServer } from 'apollo-server'
import casual = require('casual')

const prisma = new PrismaClient();
const avatarUrls = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://images-na.ssl-images-amazon.com/images/M/MV5BNTk2OGU4NzktODhhOC00Nzc2LWIyNzYtOWViMjljZGFiNTMxXkEyXkFqcGdeQXVyMTE1NTQwOTk@._V1_UY256_CR12,0,172,256_AL_.jpg',
  'https://images-na.ssl-images-amazon.com/images/M/MV5BMTc0MzgxMzQ5N15BMl5BanBnXkFtZTgwMzMzNjkwOTE@._V1_UX172_CR0,0,172,256_AL_.jpg',
  'https://images.pexels.com/photos/355164/pexels-photo-355164.jpeg?crop=faces&fit=crop&h=200&w=200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&crop=faces&fit=crop&h=200&w=200',
  'https://images-na.ssl-images-amazon.com/images/M/MV5BOTk1MzgzOTg5OV5BMl5BanBnXkFtZTcwNDQ4NjMxOA@@._V1_UY256_CR1,0,172,256_AL_.jpg',
  'https://uifaces.co/our-content/donated/2bvuFyb8.jpg',
  'https://images.generated.photos/B7CJLWXHEhr73EmhhiWyTK-WT39VwobNNqwknL-vwUg/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zLzA5/NzY1NDcuanBn.jpg',
  'https://uifaces.co/our-content/donated/6h0HeYG_.jpg',
  'https://images-na.ssl-images-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY256_CR2,0,172,256_AL_.jpg'
]
const sampleReportTypes = [
  'Lighting Issue',
  'Road Development Works',
  'Potholes',
  'Convulated Power Lines',
  'Chemical Hazard',
  'Electrical Hazard',
  'Water Leak',
  'Road Obstruction'
]

const sampleMediaUrls = [
  'https://images.unsplash.com/photo-1506702315536-dd8b83e2dcf9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80',
  'https://images.unsplash.com/photo-1587763483696-6d41d2de6084?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
  'https://images.unsplash.com/photo-1560782202-154b39d57ef2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
  'https://images.unsplash.com/photo-1569527151622-5ccd6275e21e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
  'https://images.unsplash.com/photo-1554863804-69546eb96737?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2247&q=80'
]

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
    - 'archived'
    - 'active'
    - 'draft'
    """
    state:         Int    
    "Either 'post' or 'comment'"
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
    posts: [Post]
    postAnalytic:  [PostAnalytic]
    profileName:   String
    avatarUrl:     String
    defaultCity:   City
    firstName:     String
    lastName:      String
    birthdate:     String
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


function shuffleArray(array: String[]): String[] {
  let shuffledArray: String[] = array

  let counter = array.length;

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);

    counter--;

    let temp = shuffledArray[counter];
    shuffledArray[counter] = shuffledArray[index];
    shuffledArray[index] = temp;
  }

  return shuffledArray
}

function getRandomUrls() {
  const arr: String[] = shuffleArray(sampleMediaUrls)
  const randomLength = casual.integer(0, arr.length)
  const slicedArr = arr.slice(0, randomLength)

  return slicedArr;
}


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

const mocks = {
  User: () => ({
    id: casual.integer(1, 100),
    profileName: casual.name,
    avatarUrl: casual.random_element(avatarUrls),
    firstName: casual.first_name,
    lastName: casual.last_name,
    createdAt: casual.date('YYYY-MM-DDTHH:mm:ss.SSSZZ')
  }),
  Post: () => ({
    id: casual.integer(1, 100),
    content: casual.sentences(casual.integer(1, 3)),
    createdAt: casual.date('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    state: 1,
    reactionCount: JSON.stringify({
      like: casual.integer(0, 100)
    }),
    title: casual.title,
    type: casual.random_element(sampleReportTypes),
    viewCount: casual.integer(0, 1000),
  }),
  MediaUpload: () => ({
    id: casual.integer(1, 100),
    mediaUrls: getRandomUrls()
  }),
  City: () => ({
    id: casual.integer(1, 100),
    name: casual.city,
    createdAt: casual.date('YYYY-MM-DDTHH:mm:ss.SSSZZ')
  }),
  Comment: () => ({
    id: casual.integer(1, 100),
    content: casual.sentences(casual.integer(1, 3)),
    createdAt: casual.date('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    state: 1,
    reactionCount: JSON.stringify({
      like: casual.integer(0, 100)
    }),
  }),
}

const server = new ApolloServer({
  resolvers,
  typeDefs,
  mocks,
  context: {
    prisma
  }
});


server.listen({ port: 4000 }).then((url) => {
  console.log(`🚀  Server ready at port ${url.port}`);
});