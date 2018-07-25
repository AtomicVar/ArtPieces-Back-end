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

  type Query {
    getWorkInfo(work_id: Int!): Work
    getUserInfo(user_id: Int!): User
    getUserWorks(user_id: Int!): [Work]
  }

  type Mutation {
    signUp(email: String!, nick_name: String!, password: String!): Int
    updateUserInfo(user_id: Int!, nick_name: String): Boolean
    updateWorkData(work_id: Int!, work_data: workData!): Boolean
    uploadNewWork(user_id: Int!, work_data: workData!): Int
  }
`;

const resolvers = {
  Query: {
    getWorkInfo: controller.getWorkInfo,
    getUserInfo: controller.getUserInfo,
    getUserWorks: controller.getUserWorks,
  },

  Mutation: {
    signUp: controller.signUp,
    updateUserInfo: controller.updateUserInfo,
    updateWorkData: controller.updateWorkData,
    uploadNewWork: controller.uploadNewWork,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});