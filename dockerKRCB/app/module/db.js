// DB의 각 attribute 별 getter, setter
// 딱히 필요 없을수도..

const axios = require("axios");

//const url = "http://34.84.111.3:8080/?userId=caaf36256c5eb5f81235fd2340cab0b82662ad2881623799a1c4dca711b5468180";
//const url = "http://10.146.0.2:8080";
const CreateUserIfNotExist = async (req) => {
    const userId = req.body.userRequest.user.id;
    const url = `http://34.84.111.3:8080/?userId=${userId}`;

    const config = {
        method: "post",
        url: url,
        headers: {}
    };
    await axios(config)
        .then((response) => {
            //console.log(response);
        })
        .catch((error) => {
            console.log(error);
        });
};
/*const CreateUserIfNotExist = async (req) => {
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
};*/

const SetUserInfo = async (req, wanted) => {
    const userId = req.body.userRequest.user.id;
    const url = `http://34.84.111.3:8080/?userId=${userId}`;

    let urlAppend = "";
    for (key of Object.keys(wanted)) {
        if (key == "userTrace") {
            urlAppend += `&${key}=${JSON.stringify(wanted.userTrace)}`;
        } else {
            urlAppend += `&${key}=${encodeURI(wanted[key])}`;
        }
    }
    console.log(url);
    console.log(urlAppend);
    const config = {
        method: "put",
        url: url + urlAppend
    };

    await axios(config)
        .then((response) => {
            //console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
};
/*
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
};*/

const GetUserInfo = async (req, wanted) => {
    const userId = req.body.userRequest.user.id;
    let url = `http://34.84.111.3:8080/?userId=${userId}`;

    if (wanted) {
        url += `&attribute=${wanted}`;
    }
    const config = {
        methid: "get",
        url: url,
        headers: {}
    };

    let result;
    //console.log(wanted);
    await axios(config)
        .then((response) => {
            console.log(response.data);
            result = response.data;
        })
        .catch((error) => {
            console.log(error);
            result = false;
        });

    if (!result) {
        return false;
    }

    if (!wanted) {
        return result;
    }
    if (wanted == "userTrace") {
        return JSON.parse(result.userTrace);
    }
    return result[wanted];
};
/*
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
};*/
module.exports = {
    CreateUserIfNotExist: CreateUserIfNotExist,

    GetUserInfo: GetUserInfo,
    SetUserInfo: SetUserInfo
};
