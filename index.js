import { ApolloServer, gql } from 'apollo-server';
import * as controller from './controller';
import { showPrompt } from './misc';

/* Show prompt before starting the server. */
showPrompt();

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
    data: workData
    date_time: Date
    type: workType
  }

  type Query {
    getWorkInfo(work_id: Int!): Work
    getUserInfo(user_id: Int!): User
    getUserWorks(user_id: Int!): [Work]
  }

  type Mutation {
    signUp(email: String!, nick_name: String!, password: String!): Int
    updateUserInfo(user_id: Int!, nick_name: String): User 
    updateWorkInfo(work_id: Int!, data: workData, title: String,
      description: String): Work 
    uploadNewWork(user_id: Int!, data: workData!, title: String!,
      description: String!, is_pub: Boolean!, type: workType!): Int
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
        updateWorkInfo: controller.updateWorkInfo,
        uploadNewWork: controller.uploadNewWork,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});