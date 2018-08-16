import Sequelize, { UUID, STRING, TEXT, DATE, BLOB, JSON } from 'sequelize';

const sequelize = new Sequelize('art', 'art', 'art', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    },
});

const User = sequelize.define('user', {
    email: {
        type: STRING,
        primaryKey: true
    },
    name: STRING,
    password: STRING,
    portrait: BLOB,
});

const Artwork = sequelize.define('artwork', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    title: STRING,
    description: TEXT,
    user: STRING,
    timestamp: DATE,
    picture: BLOB,
});

const Repo = sequelize.define('repo', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    title: STRING,
    root: UUID,
    user: STRING,
    timestamp: DATE,
});

const Lecture = sequelize.define('lecture', {
    id: {
        type: UUID,
        primaryKey: true,
    },
    artwork: UUID,
    title: STRING,
    description: STRING,
    steps: JSON,
    user: STRING,
    timestamp: DATE,
});

const Fllw_Relation = sequelize.define('fllw_relation', {
    user: STRING,
    follow: STRING,
});

const Star_Relation = sequelize.define('star_relation', {
    user: STRING,
    lecture: UUID,
});

const Repo_Childwork = sequelize.define('repo_childwork', {
    repo: UUID,
    artwork: UUID,
});

export {
    sequelize, User, Artwork, Lecture, Repo, Fllw_Relation, Star_Relation,
    Repo_Childwork
};
