// DB의 각 attribute 별 getter, setter
// 딱히 필요 없을수도..

const url = "http://34.84.111.3";

const CreateUserIfNotExist = async (req) => {
    const userId = req.body.userRequest.user.id;

    const userInfo = await models.user.findOne({
        where: {
            userId: userId
        }
    });

    if (userInfo) {
        return;
    }

    await models.user.create({
        userId: userId,
        userTrace: JSON.stringify({})
    });
};
const SetUserInfo = async (req, wanted) => {
    //CreateUserIfNotExist(req);

    const userId = req.body.userRequest.user.id;

    const update = {};

    for (key of Object.keys(wanted)) {
        if (key == "userTrace") {
            update.userTrace = JSON.stringify(wanted.userTrace);
        } else {
            update[key] = wanted[key];
        }
    }

    //console.log(wanted);
    //console.log(update);
    models.user.update(update, {
        where: {
            userId: userId
        }
    });
};
const GetUserInfo = async (req, wanted) => {
    const userid = req.body.userRequest.user.id;

    const userInfo = await models.user.findOne({
        where: {
            userId: userid
        }
    });

    if (!userInfo) {
        return false;
    }

    if (!wanted) {
        return userInfo;
    }

    if (wanted == "userTrace") {
        return JSON.parse(userInfo[wanted]);
    }
    return userInfo[wanted];
};
module.exports = {
    CreateUserIfNotExist: CreateUserIfNotExist,

    GetUserInfo: GetUserInfo,
    SetUserInfo: SetUserInfo
};
