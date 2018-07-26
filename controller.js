import * as model from './model';

const getWorkInfo = async (obj, args) => {
    let w = await model.Work.findOne({
        attributes: ['work_id', 'title', 'description', 'data', 'date_time', 'type'],
        where: { work_id: args.work_id },
    });
    return w;
};

const getUserInfo = async (obj, args) => {
    let u = await model.User.findOne({
        attributes: ['user_id', 'nick_name'],
        where: { user_id: args.user_id },
    });
    return u;
};

const getUserWorks = async (obj, args) => {
    let ws = model.Work.findAll({
        attributes: ['work_id', 'title', 'description', 'data', 'date_time', 'type'],
        where: { user_id: args.user_id },
    });
    return ws;
};

const signUp = async (obj, args) => {
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
};

const updateUserInfo = async (obj, args) => {
    let u = await model.User.findOne({
        attributes: ['user_id', 'nick_name'],
        where: { user_id: args.user_id },
    });
    if (args.nick_name)
        await u.update({ nick_name: args.nick_name });
    return u;
};

const updateWorkInfo = async (obj, args) => {
    let w = await model.Work.findOne({
        attributes: ['work_id', 'title', 'description', 'type'],
        where: { work_id: args.work_id },
    });
    if (args.data)
        await w.update({ data: args.data });
    if (args.title)
        await w.update({ title: args.title });
    if (args.description)
        await w.update({ description: args.description });
    return w;
};

const uploadNewWork = async (obj, args) => {
    let new_work = await model.Work.create({
        title: args.title,
        description: args.description,
        data: args.data,
        date_tile: new Date(),
        is_public: args.is_pub,
        type: args.type,
        user_id: args.user_id,
    });

    return new_work.work_id;
};

export {
    getUserInfo, getWorkInfo, getUserWorks, signUp, updateUserInfo,
    updateWorkInfo, uploadNewWork
};