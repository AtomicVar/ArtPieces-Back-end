import * as model from './model';
import uuidv4 from 'uuid/v4';
import 'babel-polyfill';
import path from 'path';
import crypto from 'crypto';

let compressedURL = '';
if (process.env.NODE_ENV == 'test') {
    compressedURL = 'http://127.0.0.1:4001/compressed';
} else {
    compressedURL = 'https://artpieces.cn/img/compressed';
}

const passwordRight = async (email, password) => {
    let u = await model.User.findOne({
        attributes: ['password', 'salt'],
        where: { email: email },
    });
    let testedPassword = crypto
        .createHash('md5')
        .update(password + u.salt)
        .digest('hex');
    return u.password == testedPassword;
};

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
    work.compressKeyPhoto = path.join(
        compressedURL,
        path.basename(work.keyPhoto)
    );
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
    user.artworks.forEach(w => {
        w.compressKeyPhoto = path.join(
            compressedURL,
            path.basename(w.keyPhoto)
        );
    });
    user.compressedPortrait = path.join(
        compressedURL,
        path.basename(user.portrait)
    );
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

const insertUser = async (obj, args) => {
    let salt = crypto.randomBytes(10).toString('hex');
    let passwd = crypto
        .createHash('md5')
        .update(args.password + salt)
        .digest('hex');
    try {
        let user = await model.User.create({
            email: args.email,
            name: args.name,
            password: passwd,
            salt: salt,
            portrait: args.portrait,
        });
        return {
            status: 0,
            payload: user.email,
        };
    } catch (e) {
        return {
            status: 1,
            payload: e.message,
        };
    }
};

const insertWork = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let work = await model.Artwork.create({
        id: uuidv4(),
        title: args.title,
        description: args.description,
        pictureURL: args.keyPhoto,
        creator: args.creator,
    });
    await model.Repo_Childwork.create({
        repo: args.belongingRepo,
        artwork: work.id,
    });
    return {
        status: 0,
        payload: work.id,
    };
};

const insertRepo = async (obj, args) => {
    if (!(await passwordRight(args.starter, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let repo = await model.Repo.create({
        id: uuidv4(),
        title: args.title,
        keyArtwork: args.keyArtwork,
        starter: args.starter,
    });
    return {
        status: 0,
        payload: repo.id,
    };
};

const insertLect = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let lect = await model.Lecture.create({
        id: uuidv4(),
        title: args.title,
        description: args.description,
        steps: args.steps,
        timestamp: new Date(args.timestamp),
        creator: args.creator,
    });
    return {
        status: 0,
        payload: lect.id,
    };
};

const removeWork = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let work = await model.Artwork.findOne({
        attributes: ['creator'],
        where: { id: args.id },
    });
    if (work.creator != args.creator) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    await model.Artwork.destroy({
        where: {
            id: args.id,
        },
    });
    await model.Repo_Childwork.destroy({
        where: {
            artwork: args.id,
        },
    });
    return {
        status: 0,
        payload: 'OK.',
    };
};

const removeRepo = async (obj, args) => {
    if (!(await passwordRight(args.starter, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let repo = await model.Repo.findOne({
        attributes: ['starter'],
        where: { id: args.id },
    });
    if (repo.starter != args.starter) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    await model.Repo.destroy({
        where: {
            id: args.id,
        },
    });
    return {
        status: 0,
        payload: 'OK.',
    };
};

const removeLect = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let lect = await model.Lecture.findOne({
        attributes: ['creator'],
        where: { id: args.id },
    });
    if (lect.creator != args.creator) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    await model.Lecture.destroy({
        where: {
            id: args.id,
        },
    });
    await model.Star_Relation.destroy({
        where: {
            lecture: args.id,
        },
    });
    return {
        status: 0,
        payload: 'OK.',
    };
};

const updateUser = async (obj, args) => {
    if (!(await passwordRight(args.email, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

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
    if (n == 0) {
        return {
            status: -3,
            payload: 'Object Not Found.',
        };
    }

    return {
        status: 0,
        payload: 'OK.',
    };
};

const updateWork = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let work = await model.Artwork.findOne({
        attributes: ['creator'],
        where: { id: args.id },
    });
    if (!work) {
        return {
            status: -3,
            payload: 'Object Not Found',
        };
    }
    if (work.creator != args.creator) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    await model.Artwork.update(
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
    return {
        status: 0,
        payload: 'OK.',
    };
};

const updateRepo = async (obj, args) => {
    if (!(await passwordRight(args.starter, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let repo = await model.Repo.findOne({
        attributes: ['starter'],
        where: { id: args.id },
    });
    if (!repo) {
        return {
            status: -3,
            payload: 'Object Not Found',
        };
    }
    if (repo.starter != args.starter) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }
    await model.Repo.update(
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
    return {
        status: 0,
        payload: 'OK.',
    };
};

const updateLect = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let lect = await model.Lecture.findOne({
        attributes: ['creator'],
        where: { id: args.id },
    });
    if (!lect) {
        return {
            status: -3,
            payload: 'Object Not Found.',
        };
    }
    if (lect.creator != args.creator) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    await model.Lecture.update(
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
    return {
        status: 0,
        payload: 'OK.',
    };
};

const follow = async (obj, args) => {
    if (!(await passwordRight(args.origin, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Fllw_Relation.create({
        user: args.origin,
        follow: args.target,
    });
    let count = model.Fllw_Relation.count({
        where: {
            follow: args.target,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const unfollow = async (obj, args) => {
    if (!(await passwordRight(args.origin, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

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
    return {
        status: 0,
        payload: count,
    };
};

const star = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Star_Relation.create({
        user: args.user,
        lecture: args.lecture,
    });
    let count = model.Star_Relation.count({
        where: {
            lecture: args.lecture,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const unstar = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

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
    return {
        status: 0,
        payload: count,
    };
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
