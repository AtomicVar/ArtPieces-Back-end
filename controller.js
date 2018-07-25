const db = require('./dbhandler');
const model = require('./model');

exports.getWorkInfo = async (obj, args, context, info) => {

}

exports.getUserInfo = async (obj, args, context, info) => {
    let u = await model.User.findOne({
        attributes: ['user_id', 'nick_name'],
        where: {user_id: args.user_id},
    });
    return u;
}

exports.getUserWorks = async (obj, args, context, info) => {

}

exports.signUp = async (obj, args, context, info) => {
    let email = args.email;
    let nick_name = args.nick_name;
    let password = args.password;

    let new_user = await model.User.create({
        email: email,
        nick_name: nick_name,
        activ_status: true,
        password: password,
    });
    return new_user.user_id;
}

exports.updateUserInfo = async (obj, args, context, info) => {

}

exports.updateWorkData = async (obj, args, context, info) => {

}

exports.uploadNewWork = async (obj, args, context, info) => {

}