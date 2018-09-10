import { ApolloServer } from 'apollo-server';
import schema from './schema.graphql';
import * as controller from './controller';
import { safeLaunch } from './misc';

/* 更安全地运行服务器（防止数据库被修改）*/
safeLaunch();

const typeDefs = schema;

const resolvers = {
    Query: {
        login: controller.login,
        getWork: controller.getWork,
        getUser: controller.getUser,
        getRepo: controller.getRepo,
        getLecture: controller.getLecture,
        getRepoFeed: controller.getRepoFeed,
        extendRepoFeed: controller.extendRepoFeed,
        getLectFeed: controller.getLectFeed,
        extendLectFeed: controller.extendLectFeed,
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

        starLect: controller.starLect,
        starRepo: controller.starRepo,
        unstarLect: controller.unstarLect,
        unstarRepo: controller.unstarRepo,
        follow: controller.follow,
        unfollow: controller.unfollow,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
