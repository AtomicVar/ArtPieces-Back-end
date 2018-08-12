import Sequelize, { INTEGER, STRING, BOOLEAN, TEXT, JSON, DATE, ENUM } from 'sequelize';

const sequelize = new Sequelize(/*database*/ 'art', /*username*/ 'art', /*password*/ 'art', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false,
    },
});

const User = sequelize.define('user', {
    user_id: {
        type: INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    },
    email: STRING,
    name: STRING(10),
    activ_status: BOOLEAN,
    password: STRING(40),
});

const Work = sequelize.define('work', {
    work_id: {
        type: INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    },
    title: STRING,
    description: TEXT,
    data: JSON,
    date_time: DATE,
    is_public: BOOLEAN,
    type: ENUM('PLAIN', 'TUTORIAL'),
});

const User_Relation = sequelize.define('user_relation', {
    user_id: INTEGER,
    following_id: INTEGER,
});

Work.belongsTo(User, { foreignKey: 'user_id' });

export { sequelize, User, Work, User_Relation };
