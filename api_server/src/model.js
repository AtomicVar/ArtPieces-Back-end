import Sequelize, { UUID, STRING, TEXT, DATE, JSON } from 'sequelize';

const database = new Sequelize('art', 'art', 'art', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    },
});

const User = database.define('user', {
    email: {
        type: STRING,
        primaryKey: true,
    },
    name: STRING,
    password: STRING,
    portrait: STRING,
});

const Artwork = database.define('artwork', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    title: STRING,
    description: TEXT,
    creator: STRING,
    timestamp: DATE,
    pictureURL: STRING,
});

const Repo = database.define('repo', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    title: STRING,
    description: STRING,
    keyArtwork: UUID,
    starter: STRING,
    timestamp: DATE,
});

const Lecture = database.define('lecture', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    title: STRING,
    description: STRING,
    steps: JSON,
    creator: STRING,
    timestamp: DATE,
});

const Fllw_Relation = database.define('fllw_relation', {
    user: STRING,
    follow: STRING,
});

const Star_Relation = database.define('star_relation', {
    user: STRING,
    lecture: UUID,
});

const Repo_Childwork = database.define('repo_childwork', {
    repo: UUID,
    artwork: UUID,
});

export {
    database,
    User,
    Artwork,
    Lecture,
    Repo,
    Fllw_Relation,
    Star_Relation,
    Repo_Childwork,
};
