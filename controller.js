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
    let u = await model.User.findOne({
        attributes: ['user_id', 'nick_name'],
        where: {user_id: args.user_id},
    });
    if (args.nick_name)
        await u.update({nick_name: args.nick_name});
    return u;
}

exports.updateWorkInfo = async (obj, args, context, info) => {
    let w = await model.Work.findOne({
        attributes: ['work_id', 'title','description', 'type'],
        where: {work_id: args.work_id},
    });
    if (args.data)
        await w.update({data: args.data});
    if (args.title)
        await w.update({title: args.title});
    if (args.description)
        await w.update({description: args.description});
    return w;
}

exports.uploadNewWork = async (obj, args, context, info) => {
    let new_work = await model.Work.create({
        title: args.title,
        description: args.description,
        data: args.data,
        date_tile: new Date(),
        is_public: args.is_pub,
        type: args.type,
    });

    await model.User_Work.create({
        user_id: args.user_id,
        work_id: new_work.work_id,
    });

    return new_work.work_id;
}