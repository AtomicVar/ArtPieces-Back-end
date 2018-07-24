const { ApolloServer, gql } = require('apollo-server');
const controller = require('./controller');
const misc = require('./misc');

/* Show prompt before starting the server. */
misc.showPrompt();

const typeDefs = gql`
  scalar Date

  enum workType {
    plain
    tutorial
  }

  type Work {
    title: String
    author: Int
    data: String
    dateTime: Date
    type: workType
  }

  type Query {
    getWork(workID: Int!): Work
  }
`;

const resolvers = {
  Query: {
    getWork: controller.getWork,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});