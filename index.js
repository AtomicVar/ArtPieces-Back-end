const { ApolloServer, gql } = require('apollo-server');
const controller = require('./controller');
const misc = require('./misc');

/* Show prompt before starting the server. */
misc.showPrompt();

const typeDefs = gql`
  scalar Date
  scalar workData

  enum workType {
    PLAIN 
    TUTOR
  }

  type User {
    user_id: Int
    nick_name: String
  }

  type Work {
    work_id: Int
    title: String
    description: String
    author: Int
    data: workData
    dateTime: Date
    type: workType
  }

  type MetaData {
    access_token: String
  }

  type Query {
    getWorkInfo(work_id: Int!): Work
    getUserInfo(user_id: Int!): User
    getUserWorks(user_id: Int!): [Work]
  }
`;

const resolvers = {
  Query: {
    getWorkInfo: controller.getWorkInfo,
    getUserInfo: controller.getUserInfo,
    getUserWorks: controller.getUserWorks,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});