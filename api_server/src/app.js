import { ApolloServer } from 'apollo-server';
import schema from './schema.graphql';
import * as controller from './controller';
import { showPrompt } from './misc';

/* Show prompt before starting the server. */
showPrompt();

const typeDefs = schema;

const resolvers = {
    Query: {
        getWork: controller.getWork,
        getUser: controller.getUser,
        getRepo: controller.getRepo,
        getLecture: controller.getLecture,
    },

    Mutation: {
        insertUser: controller.insertUser,
        insertWork: controller.insertWork,
        insertRepo: controller.insertRepo,
        insertLect: controller.insertLect,

        removeWork: controller.removeWork,
        removeRepo: controller.removeRepo,
        removeLect: controller.removeLect,

        updateUser: controller.updateUser,
        updateWork: controller.updateWork,
        updateRepo: controller.updateRepo,
        updateLect: controller.updateLect,

        star: controller.star,
        unstar: controller.unstar,
        follow: controller.follow,
        unfollow: controller.unfollow,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
