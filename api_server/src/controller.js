import * as model from './model';
import uuidv4 from 'uuid/v4';
import 'babel-polyfill';

const getWork = async (obj, args) => {
    let work = await model.Artwork.findOne({
        attributes: [
            'id',
            'title',
            'description',
            'user',
            'timestamp',
            'picture',
        ],
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
        attributes: [
            'id',
            'title',
            'description',
            'user',
            'timestamp',
            'picture',
        ],
        where: { user: args.email },
    });
    user.repos = await model.Repo.findAll({
        attributes: ['id', 'title', 'root', 'title', 'user', 'timestamp'],
        where: { user: args.email },
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
        attributes: [
            'id',
            'artwork',
            'title',
            'description',
            'steps',
            'user',
            'timestamp',
        ],
        where: { id: args.id },
    });
    lect.numberOfSteps = lect.steps.length;
    lect.numberOfStars = await model.Star_Relation.count({
        where: { lecture: args.id },
    });
    return lect;
};

const updateUser = async (obj, args) => {
    let [n] = await model.User.update(
        {
            name: args.name,
            password: args.password,
            portrait: args.portrait,
        },
        {
            where: {
                email: args.email,
            },
        }
    );
    return n == 1;
};

const insertUser = async (obj, args) => {
    let user = await model.User.create({
        email: args.email,
        name: args.name,
        password: args.password,
        portrait: args.portrait,
    });
    return user.email;
};

const updateWork = async (obj, args) => {
    let [n] = await model.Artwork.update(
        {
            title: args.title,
            description: args.description,
            pictureURL: args.keyPhoto,
            user: args.creator,
        },
        {
            where: {
                id: args.id,
            },
        }
    );
    return n == 1;
};

const insertWork = async (obj, args) => {
    let work = await model.Artwork.create({
        id: uuidv4(),
        title: args.title,
        description: args.description,
        pictureURL: args.keyPhoto,
        user: args.creator,
    });
    await model.Repo_Childwork.create({
        repo: args.belongingRepo,
        artwork: work.id,
    });
    return work.id;
};

const updateRepo = async (obj, args) => {
    let [n] = await model.Repo.update(
        {
            title: args.title,
            description: args.description,
        },
        {
            where: {
                id: args.id,
            },
        }
    );
    return n == 1;
};

const insertRepo = async (obj, args) => {
    let repo = await model.Repo.create({
        id: uuidv4(),
        title: args.title,
        keyArtwork: args.keyArtwork,
        user: args.starter,
    });
    return repo.id;
};

const updateLect = async (obj, args) => {
    let [n] = await model.Lecture.update(
        {
            title: args.title,
            description: args.description,
            steps: args.steps,
        },
        {
            where: {
                id: args.id,
            },
        }
    );
    return n == 1;
};

const insertLect = async (obj, args) => {
    let lect = await model.Lecture.create({
        id: uuidv4(),
        title: args.title,
        description: args.description,
        steps: args.steps,
        timestamp: new Date(args.timestamp),
        creator: args.creator,
    });
    return lect.id;
};

export {
    getUser,
    getWork,
    getRepo,
    getLecture,
    updateUser,
    insertUser,
    updateWork,
    insertWork,
    updateRepo,
    insertRepo,
    updateLect,
    insertLect,
};
