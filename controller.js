import * as model from './model';

const getWork = async (obj, args) => {
    let work = await model.Artwork.findOne({
        attributes: ['id', 'title', 'description', 'user', 'timestamp', 'picture'],
        where: { id: args.id },
    });
    return work;
};

const getUser = async (obj, args) => {
    let user = await model.User.findOne({
        attributes: ['email', 'name', 'portrait'],
        where: { email: args.email },
    });
    user.artworks = await model.Artwork.findAll({
        attributes: ['id', 'title', 'description', 'user', 'timestamp', 'picture'],
        where: { user: args.email },
    });
    user.repos = await model.Repo.findAll({
        attributes: ['id', 'title', 'root', 'title', 'user', 'timestamp'],
        where: { user: args.email }
    });
    return user;
};

const getRepo = async (obj, args) => {
    let repo = await model.Repo.findOne({
        attributes: ['id', 'title', 'root', 'title', 'user', 'timestamp'],
        where: { id: args.id },
    });
    return repo;
};

const getLecture = async (obj, args) => {
    let lect = await model.Lecture.findOne({
        attributes: ['id', 'artwork', 'title', 'description', 'steps', 'user', 'timestamp'],
        where: { id: args.id },
    });
    lect.numberOfSteps = lect.steps.length;
    lect.numberOfStars = await model.Star_Relation.count({
        where: { lecture: args.id },
    });
    return lect;
};

const upsertUser = async (obj, args) => {
    let user = await model.User.upsert({
        email: args.email,
        name: args.name,
        password: args.password,
        portrait: args.portrait,
    });
    return user;
};

const upsertWork = async (obj, args) => {
    let work = await model.Artwork.upsert({
        title: args.title,
        description: args.description,
        data: args.data,
        date_tile: new Date(),
        is_public: args.is_pub,
        type: args.type,
        user_id: args.user_id,
    });

    return work.id;
};

export { getUser, getWork, getRepo, getLecture, upsertUser, upsertWork };
