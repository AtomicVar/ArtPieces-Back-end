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
    salt: STRING,
    portrait: STRING,
    signature: STRING,
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
    keyPhoto: STRING,
    belongingRepo: UUID,
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
    keyPhoto: STRING,
    creator: STRING,
    timestamp: DATE,
});

const Fllw_User = database.define('fllw_user', {
    user: STRING,
    follow: STRING,
});

const Star_Lecture = database.define('star_lecture', {
    user: STRING,
    lecture: UUID,
});

const Star_Repo = database.define('star_repo', {
    user: STRING,
    repo: UUID,
});

export {
    database,
    User,
    Artwork,
    Lecture,
    Repo,
    Fllw_User,
    Star_Lecture,
    Star_Repo,
};
