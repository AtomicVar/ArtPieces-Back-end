const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    define: {
        timestamps: false,
    },
});

const User = sequelize.define('user', {
    user_id: {
        type: Sequelize.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    },
    email: Sequelize.STRING,
    nick_name: Sequelize.STRING(10),
    activ_status: Sequelize.BOOLEAN,
    password: Sequelize.STRING(40),
});

const User_Work = sequelize.define('user_work', {
    user_id: Sequelize.INTEGER,
    work_id: Sequelize.INTEGER,
});

const Work = sequelize.define('work', {
    work_id: {
        type: Sequelize.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    data: Sequelize.JSON,
    date_time: Sequelize.DATE,
    is_public: Sequelize.BOOLEAN,
    type: Sequelize.ENUM('PLAIN', 'TUTORIAL'),
});

const User_Relation = sequelize.define('user_relation', {
    user_id: Sequelize.INTEGER,
    following_id: Sequelize.INTEGER,
})

if (process.env.NODE_ENV == 'dev') {
    sequelize.sync({ force: true });
} else {
    sequelize.sync();
}

module.exports = {
    User: User,
    User_Work: User_Work,
    Work: Work,
    User_Relation: User_Relation,
};
