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

  type Profile {
    id: Int
    name: String
  }

  type User {
    id: Int
    profile: Profile
  }

  type Mutation {
    createProfile(
      userId: Int
      name: String
    ): Profile!
    
    createUser(
      karmaPoints: Int
      profile: ProfileCreateInput
    ): User!
  }

  type Query {
    allProfiles: [Profile!]!
    allUsers: [User!]!
  }`;


const resolvers = {
  Query: {
    allProfiles: () => {
      return prisma.profile.findMany({});
    },
    allUsers: () => {
      return prisma.user.findMany({});
    },
  },
  User: {
    profile: (parent: { id: any; }) => {
      return prisma.user.findUnique({
        where: {
          id: parent.id
        }
      }).profile()
    }
  },
  Mutation: {
    createUser: (parent: any, args: any, ctx: any, info: any) => {
      return ctx.prisma.user.create({
        data: {
          karmaPoints: args.karmaPoints,
          profile: {
            create: {
              name: args.profile.name
            }
          }
        }
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