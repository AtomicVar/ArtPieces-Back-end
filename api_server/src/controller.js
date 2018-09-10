import * as model from './model';
import 'babel-polyfill';
import path from 'path';
import crypto from 'crypto';
import request from 'request-promise-native';
import { Op } from 'sequelize';

// APPCODE 用来做身份认证，防止第三方的“销毁图片”请求被执行。 
import APPCODE from '../../APPCODE.json';

const compressedURL = 'https://artpieces.cn/img/compressed';

// 检查帐号与密码是否匹配
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

// 销毁老图片
const destroyImage = async img => {
    let options = {
        method: 'POST',
        uri: 'http://127.0.0.1:4001/destroy',
        headers: {
            appcode: APPCODE,
        },
        json: {
            filename: img,
        },
    };
    let body = await request(options);
    return body == 'OK';
};

// APIs

const login = async (obj, args) => {
    let user = await model.User.findOne({
        attributes: ['password', 'salt'],
        where: { email: args.email },
    });
    if (user) {
        let encodedPasswd = crypto
            .createHash('md5')
            .update(args.password + user.salt)
            .digest('hex');
        if (encodedPasswd == user.password) {
            return {
                status: 0,
                payload: 'Loggin successfully.',
            };
        } else {
            return {
                status: -1,
                payload: 'Access Denied: wrong password',
            };
        }
    } else {
        return {
            status: -3,
            payload: 'Object not found',
        };
    }
};

const getWork = async (obj, args) => {
    let work = await model.Artwork.findOne({
        attributes: [
            'id',
            'title',
            'description',
            'creator',
            'timestamp',
            'belongingRepo',
            'keyPhoto',
        ],
        where: { id: args.id },
    });

    if (!work) return null;

    work.compressedKeyPhoto = path.join(
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
    if (!user) {
        return null;
    }

    // artworks
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
        w.compressedKeyPhoto = path.join(
            compressedURL,
            path.basename(w.keyPhoto)
        );
    });

    // If the user has a portrait, provide a compressed version
    if (user.portrait) {
        user.compressedPortrait = path.join(
            compressedURL,
            path.basename(user.portrait)
        );
    }

    // repos
    user.repos = await model.Repo.findAll({
        attributes: ['id', 'title', 'keyArtwork', 'starter', 'timestamp'],
        where: { starter: args.email },
    });

    // complete repos
    for (let i in user.repos) {
        let artwork = await model.Artwork.findOne({
            attributes: [
                'id',
                'title',
                'description',
                'creator',
                'timestamp',
                'keyPhoto',
            ],
            where: { id: user.repos[i].keyArtwork },
        });
        if (artwork.keyPhoto) {
            artwork.compressedKeyPhoto = path.join(
                compressedURL,
                path.basename(artwork.keyPhoto)
            );
        }
        user.repos[i].keyArtwork = artwork;

        user.repos[i].artworks = await model.Artwork.findAll({
            attributes: [
                'id',
                'title',
                'description',
                'creator',
                'timestamp',
                'keyPhoto',
            ],
            where: { belongingRepo: user.repos[i].id },
        });
        for (let j in user.repos[i].artworks) {
            if (user.repos[i].artworks[j].keyPhoto) {
                user.repos[i].artworks[j].compressedKeyPhoto = path.join(
                    compressedURL,
                    path.basename(artwork.keyPhoto)
                );
            }
        }
        user.repos[i].artworks.push(user.repos[i].keyArtwork);

        user.repos[i].numberOfArtworks = await model.Artwork.count({
            where: { belongingRepo: user.repos[i].id },
        });
        user.repos[i].numberOfStars = await model.Star_Repo.count({
            where: { repo: user.repos[i].id },
        });
    }

    // lectures
    user.lectures = await model.Lecture.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'steps',
            'creator',
            'keyPhoto',
            'timestamp',
        ],
        where: { creator: args.email },
    });

    // complete lectures
    for (let i in user.lectures) {
        user.lectures[i].numberOfStars = await model.Star_Lecture.count({
            where: { lecture: user.lectures[i].id },
        });
        user.lectures[i].numberOfSteps = JSON.parse(user.lectures[i].steps).guide.steps.length;
        if (user.lectures[i].keyPhoto) {
            user.lectures[i].compressedKeyPhoto = path.join(
                compressedURL,
                path.basename(user.lectures[i].keyPhoto)
            );
        }
    }

    return user;
};

const getRepo = async (obj, args) => {
    let repo = await model.Repo.findOne({
        attributes: ['id', 'title', 'keyArtwork', 'starter', 'timestamp'],
        where: { id: args.id },
    });
    let artworks = await model.Artwork.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'creator',
            'timestamp',
            'keyPhoto',
        ],
        where: { belongingRepo: args.id },
    });

    if (!repo) return null;

    repo.artworks = artworks;
    repo.numberOfArtworks = artworks.length;
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
            'keyPhoto',
            'timestamp',
        ],
        where: { id: args.id },
    });

    if (!lect) return null;

    lect.numberOfSteps = JSON.parse(lect.steps).guide.steps.length;
    lect.numberOfStars = await model.Star_Lecture.count({
        where: { lecture: args.id },
    });
    if (lect.keyPhoto) {
        lect.compressedKeyPhoto = path.join(
            compressedURL,
            path.basename(lect.keyPhoto)
        );
    }
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
            signature: args.signature,
        });
        return {
            status: 0,
            payload: user.email,
        };
    } catch (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            return {
                status: -4,
                payload: 'The target is already in the database!',
            };
        } else {
            return {
                status: 1,
                payload: err,
            };
        }
    }
};

const insertWork = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    try {
        let work = await model.Artwork.create({
            id: args.id,
            title: args.title,
            description: args.description,
            keyPhoto: args.keyPhoto,
            creator: args.creator,
            timestamp: args.timestamp,
            belongingRepo: args.belongingRepo,
        });
        return {
            status: 0,
            payload: work.id,
        };
    } catch (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            return {
                status: -4,
                payload: 'The target is already in the database!',
            };
        } else {
            return {
                status: 1,
                payload: err,
            };
        }
    }
};

const insertRepo = async (obj, args) => {
    if (!(await passwordRight(args.starter, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    try {
        let repo = await model.Repo.create({
            id: args.id,
            title: args.title,
            keyArtwork: args.keyArtwork,
            starter: args.starter,
            description: args.description,
            timestamp: new Date(args.timestamp),
        });
        return {
            status: 0,
            payload: repo.id,
        };
    } catch (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            return {
                status: -4,
                payload: 'The target is already in the database!',
            };
        } else {
            return {
                status: 1,
                payload: err,
            };
        }
    }
};

const insertLect = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    try {
        let lect = await model.Lecture.create({
            id: args.id,
            title: args.title,
            description: args.description,
            steps: args.steps,
            timestamp: new Date(args.timestamp),
            keyPhoto: args.keyPhoto,
            creator: args.creator,
        });
        return {
            status: 0,
            payload: lect.id,
        };
    } catch (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            return {
                status: -4,
                payload: 'The target is already in the database!',
            };
        } else {
            return {
                status: 1,
                payload: err,
            };
        }
    }
};

const removeWork = async (obj, args) => {
    if (!(await passwordRight(args.creator, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    let work = await model.Artwork.findOne({
        attributes: ['creator', 'keyPhoto'],
        where: { id: args.id },
    });
    if (work.creator != args.creator) {
        return {
            status: -2,
            payload: 'Access Denied: illegal identity.',
        };
    }

    if (!(await destroyImage(path.basename(work.keyPhoto)))) {
        console.error('Error occurred in destroying an image.');
    }

    await model.Artwork.destroy({
        where: {
            id: args.id,
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
    await model.Star_Lecture.destroy({
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
            password: args.newPassword,
            portrait: args.portrait,
            signature: args.signature,
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
            keyPhoto: args.keyPhoto,
            creator: args.creator,
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
            keyPhoto: args.keyPhoto,
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

    await model.Fllw_User.create({
        user: args.origin,
        follow: args.target,
    });
    let count = await model.Fllw_User.count({
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

    await model.Fllw_User.destroy({
        where: {
            user: args.origin,
            follow: args.target,
        },
    });
    let count = await model.Fllw_User.count({
        where: {
            follow: args.target,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const starLect = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Star_Lecture.create({
        user: args.user,
        lecture: args.lecture,
    });
    let count = await model.Star_Lecture.count({
        where: {
            lecture: args.lecture,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const unstarLect = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Star_Lecture.destroy({
        where: {
            user: args.user,
            lecture: args.lecture,
        },
    });
    let count = await model.Star_Lecture.count({
        where: {
            lecture: args.lecture,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const starRepo = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Star_Repo.create({
        user: args.user,
        repo: args.repo,
    });
    let count = await model.Star_Repo.count({
        where: {
            repo: args.repo,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const unstarRepo = async (obj, args) => {
    if (!(await passwordRight(args.user, args.password))) {
        return {
            status: -1,
            payload: 'Access Denied: wrong password.',
        };
    }

    await model.Star_Repo.destroy({
        where: {
            user: args.user,
            repo: args.repo,
        },
    });
    let count = await model.Star_Repo.count({
        where: {
            repo: args.repo,
        },
    });
    return {
        status: 0,
        payload: count,
    };
};

const getRepoFeed = async (obj, args) => {
    let repos = await model.Repo.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'starter',
            'timestamp',
            'keyArtwork',
        ],
        order: [['timestamp', 'DESC']],
        limit: 6,
        where: {
            timestamp: {
                [Op.gt]: new Date(args.timestamp),
            },
        },
    });

    // Build up keyArtwork & starter
    for (let i in repos) {
        let work = await model.Artwork.findOne({
            attributes: [
                'id',
                'title',
                'description',
                'creator',
                'timestamp',
                'belongingRepo',
                'keyPhoto',
            ],
            where: { id: repos[i].keyArtwork },
        });
        work.compressedKeyPhoto = path.join(
            compressedURL,
            path.basename(work.keyPhoto)
        );
        repos[i].keyArtwork = work;

        repos[i].numberOfArtworks = await model.Artwork.count({
            where: { belongingRepo: repos[i].id },
        });

        repos[i].numberOfStars = await model.Star_Repo.count({
            where: { repo: repos[i].id },
        });

        let user = await model.User.findOne({
            attributes: ['email', 'name', 'portrait'],
            where: { email: repos[i].starter },
        });
        if (user.portrait) {
            user.compressedPortrait = path.join(
                compressedURL,
                path.basename(user.portrait)
            );
        }
        repos[i].starter = user;
    }

    return repos;
};

const extendRepoFeed = async (obj, args) => {
    let repos = await model.Repo.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'starter',
            'timestamp',
            'keyArtwork',
        ],
        order: [['timestamp', 'DESC']],
        limit: 6,
        where: {
            timestamp: {
                [Op.lt]: new Date(args.timestamp),
            },
        },
    });

    // Build up keyArtwork & starter
    for (let i in repos) {
        let work = await model.Artwork.findOne({
            attributes: [
                'id',
                'title',
                'description',
                'creator',
                'timestamp',
                'belongingRepo',
                'keyPhoto',
            ],
            where: { id: repos[i].keyArtwork },
        });
        work.compressedKeyPhoto = path.join(
            compressedURL,
            path.basename(work.keyPhoto)
        );
        repos[i].keyArtwork = work;

        repos[i].numberOfArtworks = await model.Artwork.count({
            where: { belongingRepo: repos[i].id },
        });

        repos[i].numberOfStars = await model.Star_Repo.count({
            where: { repo: repos[i].id },
        });

        let user = await model.User.findOne({
            attributes: ['email', 'name', 'portrait'],
            where: { email: repos[i].starter },
        });
        if (user.portrait) {
            user.compressedPortrait = path.join(
                compressedURL,
                path.basename(user.portrait)
            );
        }
        repos[i].starter = user;
    }

    return repos;
};

const getLectFeed = async (obj, args) => {
    let lectures = await model.Lecture.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'creator',
            'steps',
            'timestamp',
            'keyPhoto',
        ],
        order: [['timestamp', 'DESC']],
        limit: 6,
        where: {
            timestamp: {
                [Op.gt]: new Date(args.timestamp),
            },
        },
    });

    // Build up creator
    for (let i in lectures) {
        lectures[i].numberOfStars = await model.Star_Lecture.count({
            where: { lecture: lectures[i].id },
        });
        lectures[i].numberOfSteps = JSON.parse(lectures[i].steps).guide.steps.length;
        if (lectures[i].keyPhoto) {
            lectures[i].compressedKeyPhoto = path.join(
                compressedURL,
                path.basename(lectures[i].keyPhoto)
            );
        }

        let user = await model.User.findOne({
            attributes: ['email', 'name', 'portrait'],
            where: { email: lectures[i].creator },
        });
        if (user.portrait) {
            user.compressedPortrait = path.join(
                compressedURL,
                path.basename(user.portrait)
            );
        }
        lectures[i].creator = user;
    }

    return lectures;
};

const extendLectFeed = async (obj, args) => {
    let lectures = await model.Lecture.findAll({
        attributes: [
            'id',
            'title',
            'description',
            'steps',
            'creator',
            'timestamp',
            'keyPhoto',
        ],
        order: [['timestamp', 'DESC']],
        limit: 6,
        where: {
            timestamp: {
                [Op.lt]: new Date(args.timestamp),
            },
        },
    });

    // Build up keyArtwork & creator
    for (let i in lectures) {
        lectures[i].numberOfStars = await model.Star_Lecture.count({
            where: { lecture: lectures[i].id },
        });
        if (lectures[i].keyPhoto) {
            lectures[i].compressedKeyPhoto = path.join(
                compressedURL,
                path.basename(lectures[i].keyPhoto)
            );
        }

        let user = await model.User.findOne({
            attributes: ['email', 'name', 'portrait'],
            where: { email: lectures[i].creator },
        });
        if (user.portrait) {
            user.compressedPortrait = path.join(
                compressedURL,
                path.basename(user.portrait)
            );
        }
        lectures[i].creator = user;
    }

    return lectures;
};

export {
    login,
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
    starLect,
    unstarLect,
    starRepo,
    unstarRepo,
    getRepoFeed,
    extendRepoFeed,
    getLectFeed,
    extendLectFeed,
};
