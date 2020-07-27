// DB의 각 attribute 별 getter, setter
// 딱히 필요 없을수도..

const SetUserInfo = async (req) => {
    const userId = req.body.userRequest.user.id;

    const userInfo = await models.user.findOne({
        where: {
            userId: userId
        }
    });

    if (!userInfo) {
        await models.user.create({
            userId: userId,
            userTrace: JSON.stringify({})
        });
    }
};
const GetUserInfo = async (req) => {
    const userid = req.body.userRequest.user.id;

    const userInfo = await models.user.findOne({
        where: {
            userId: userid
        }
    });

    if (!userInfo) {
        return false;
    }

    return userInfo;
};
const GetUserTrace = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return JSON.parse(userInfo.userTrace);
};

const SetUserTrace = async (req) => {
    const userId = req.body.userRequest.user.id;

    models.user.update(
        {
            userTrace: JSON.stringify({
                title: req.body.userRequest.route.title,
                subject: req.body.userRequest.route.subject
            })
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserAccessId = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.accessId;
};
const SetUserAccessId = async (req) => {
    const userId = req.body.userRequest.user.id;

    //console.log("Setting User Access ID ...");
    await models.user.update(
        {
            userAccessId: req.body.userRequest.accessId
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserGameType = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.userGameType;
};
const SetUserGameType = async (req) => {
    const userId = req.body.userRequest.user.id;

    await models.user.update(
        {
            userGameType: req.body.userRequest.gameType
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserRiderName = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.userGameType;
};
const SetUserRiderName = async (req) => {
    const userId = req.body.userRequest.user.id;

    await models.user.update(
        {
            userRiderName: req.body.userRequest.riderName
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserGameAmount = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.userGameType;
};
const SetUserGameAmount = async (req) => {
    const userId = req.body.userRequest.user.id;

    await models.user.update(
        {
            userGameAmount: req.body.userRequest.gameAmount
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserDataType = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.userDataType;
};
const SetUserDataType = async (req) => {
    const userId = req.body.userRequest.user.id;

    await models.user.update(
        {
            userDataType: req.body.userRequest.dataType
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
const GetUserData = async (req) => {
    const userId = req.body.userRequest.user.id;

    let userInfo = await GetUserInfo(req);

    return userInfo.userData;
};
const SetUserData = async (req) => {
    const userId = req.body.userRequest.user.id;

    await models.user.update(
        {
            userData: req.body.userRequest.data
        },
        {
            where: {
                userId: userId
            }
        }
    );
};
module.exports = {
    GetUserTrace: GetUserTrace,
    SetUserTrace: SetUserTrace,

    GetUserAccessId: GetUserAccessId,
    SetUserAccessId: SetUserAccessId,

    GetUserGameType: GetUserGameType,
    SetUserGameType: SetUserGameType,

    GetUserRiderName: GetUserRiderName,
    SetUserRiderName: SetUserRiderName,

    GetUserGameAmount: GetUserGameAmount,
    SetUserGameAmount: SetUserGameAmount,

    GetUserInfo: GetUserInfo,
    SetUserInfo: SetUserInfo,

    SetUserDataType: SetUserDataType,
    GetUserDataType: GetUserDataType,

    GetUserData: GetUserData,
    SetUserData: SetUserData
};
