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
        upsertUser: controller.upsertUser,
        upsertWork: controller.upsertWork,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});