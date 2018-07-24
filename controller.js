const db = require('./dbhandler');

const getWork = async (obj, args, context, info) => {
    return {
        author: 1234,
        title: "yoyo",
    }
}

module.exports = {
    getWork: getWork
}