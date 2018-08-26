import * as model from './model';
import uuidv4 from 'uuid/v4';
import 'babel-polyfill';
import path from 'path';

let compressedURL = '';
if (process.env.NODE_ENV == 'test') {
    compressedURL = 'http://127.0.0.1:4001/compressed';
}
else {
    compressedURL = 'http://95.179.143.156:4001/compressed';
}


const getWork = async (obj, args) => {
    let work = await model.Artwork.findOne({
        attributes: [
            'id',
            'title',
            'description',
            'creator',
            'timestamp',
            'keyPhoto',
        ],
        where: { id: args.id },
    });
    work.compressKeyPhoto = path.join(compressedURL, path.basename(work.keyPhoto));
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
            'creator',
            'timestamp',
            'keyPhoto',
        ],
        where: { creator: args.email },
    });

    // Add compressed URL for the portrait and keyPhotos
    user.artworks.forEach((w) => {
        w.compressKeyPhoto = path.join(compressedURL, path.basename(w.keyPhoto));
    });
    user.compressedPortrait = path.join(compressedURL, path.basename(user.portrait));
    user.repos = await model.Repo.findAll({
        attributes: ['id', 'title', 'keyArtwork', 'starter', 'timestamp'],
        where: { starter: args.email },
    });
    return user;
};

const getRepo = async (obj, args) => {
    let repo = await model.Repo.findOne({
        attributes: ['id', 'title', 'keyArtwork', 'starter', 'timestamp'],
        where: { id: args.id },
    });
    return repo;
};

const getLecture = async (obj, args) => {
    let lect = await model.Lecture.findOne({
        attributes: [
            'id',
            'title',
            'description',
            'steps',
            'creator',
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

const removeWork = async (obj, args) => {
    let n1 = await model.Artwork.destroy({
        where: {
            id: args.id,
        }
    });
    let n2 = await model.Repo_Childwork.destroy({
        where: {
            artwork: args.id,
        }
    });
    return n1 == 1 && n2 == 1;
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

const removeRepo = async (obj, args) => {
    let n = await model.Repo.destroy({
        where: {
            id: args.id,
        }
    });
    return n == 1;
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

const removeLect = async (obj, args) => {
    let n = await model.Lecture.destroy({
        where: {
            id: args.id,
        }
    });
    await model.Star_Relation.destroy({
        where: {
            lecture: args.id,
        }
    });
    return n == 1;
};

const follow = async (obj, args) => {
    await model.Fllw_Relation.create({
        user: args.origin,
        follow: args.target,
    });
    let count = model.Fllw_Relation.count({
        where: {
            follow: args.target,
        },
    });
    return count;
};

const unfollow = async (obj, args) => {
    await model.Fllw_Relation.destroy({
        where: {
            user: args.origin,
            follow: args.target,
        },
    });
    let count = model.Fllw_Relation.count({
        where: {
            follow: args.target,
        },
    });
    return count;
};

const star = async (obj, args) => {
    await model.Star_Relation.create({
        user: args.user,
        lecture: args.lecture,
    });
    let count = model.Star_Relation.count({
        where: {
            lecture: args.lecture,
        },
    });
    return count;
};

const unstar = async (obj, args) => {
    await model.Star_Relation.destroy({
        where: {
            user: args.user,
            lecture: args.lecture,
        },
    });
    let count = model.Star_Relation.count({
        where: {
            lecture: args.lecture,
        },
    });
    return count;
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
    removeWork,
    updateRepo,
    insertRepo,
    removeRepo,
    updateLect,
    insertLect,
    removeLect,
    follow,
    unfollow,
    star,
    unstar,   
};
