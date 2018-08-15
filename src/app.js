import { ApolloServer, gql } from 'apollo-server';
import * as controller from './controller';
import { showPrompt } from './misc';

/* Show prompt before starting the server. */
showPrompt();

const typeDefs = gql`
  scalar Datetime
  scalar JSON
  scalar Image
  scalar UUID
  scalar Msg
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type User {
    email: String
    name: String
    portrait: Image
    artworks: [Artwork]
    repos: [Repo]
  }

  type Artwork {
    id: UUID
    keyPhoto: Image
    title: String
    description: String
    creator: String
    timestamp: Datetime
    belongingRepo: UUID
  }

  type Repo {
    id: UUID
    keyArtwork: Artwork
    title: String
    Starter: User
    timestamp: Datetime
    artworks: [Artwork]
  }

  type Lecture {
    id: UUID
    artwork: Artwork
    title: String
    description: String
    timestamp: Datetime
    creator: User
    numberOfSteps: Int
    steps: JSON
    numberOfStars: Int
  }

  type Query {
    getWork(id: UUID!): Artwork
    getUser(email: String!): User
    getRepo(id: UUID!): Repo
    getLecture(id: UUID!): Lecture
  }

  type Mutation {
    """
    Update or insert an user.

    An update will be executed if there is an old user having the same email. Otherwise a new user will be added.
    
    Return \`true\` if an insert is executed, \`false\` for an update.
    """
    upsertUser(email: String!, name: String!, password: String!, portrait: Image): Boolean

    """
    Update or insert a work.

    An update will be executed if there is an old work having the same email. Otherwise a new user will be added.
    
    Return \`true\` if an insert is executed, \`false\` for an update.
    """
    upsertWork(email: Int!, keyPhoto: Image!, title: String!, description: String!, belongingRepo: UUID): Int
    imgUpload(img: Upload!): File!
  }
`;

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
        imgUpload: controller.imgUpload,
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});