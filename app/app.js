console.log("----------------------------------------------------------------");
console.log(`${new Date()}`);
console.log(`System Loading...`);
console.log("----------------------------------------------------------------");
const WAIT_BEFORE_SERVER_CLOSE = parseInt(process.env.WAIT_BEFORE_SERVER_CLOSE) || 10;
// require('@google-cloud/trace-agent').start();

/********************************
 시스템 모듈
********************************/
const fs = require("fs");
const util = require("util");
const querystring = require("querystring");

global.show = (obj) => {
    console.log(util.inspect(obj, { depth: Infinity, colors: true, compact: true }));
};

/********************************
 NPMs
********************************/
const axios = require("axios");

/********************************
 Express 세팅
********************************/
const app = require("express")();
const cookieParser = require("cookie-parser");

/*********************************************
 Sequelize
*********************************************/
global.Sequelize = require("sequelize");
const Op = Sequelize.Op;
global.Op = Op;

const dbConfig = {
    "username": "root",
    "password": "",
    "database": "rps",
    "config": {
        "dialect": "mysql",
        "host": "34.84.8.67",
        "port": 3306,
        "pool": {
            "max": 5
        },
        "timezone": "+09:00",
        "define": {
            "underscored": true,
            "freezeTableName": false,
            "charset": "utf8",
            "dialectOptions": {
                "collate": "utf8mb4_unicode_ci"
            },
            "timestamps": true
        }
    }
};
global.gameTypes = {
    "SpeedTeam": "7b9f0fd5377c38514dbb78ebe63ac6c3b81009d5a31dd569d1cff8f005aa881a",
    "SpeedSolo": "effd66758144a29868663aa50e85d3d95c5bc0147d7fdb9802691c2087f3416e",
    "ItemTeam": "7ca6fd44026a2c8f5d939b60aa56b4b1714b9cc2355ec5e317154d4cf0675da0",
    "ItemSolo": "14e772d195642279cf6c8307125044274db371c1b08fc3dd6553e50d76d2b3aa"
};

global.Block = {
    welcome: "sc5x7uir6c7n4o1f6rmjjm1u",
    mainmenu: "5f17f4d9b9a8750001c68508"
};
global.Msg = require("./module/message.js");
global.Builder = require("./module/block.js");
global.DataBase = require("./module/db.js");
global.track = require("./data/track.json");
global.kart = require("./data/kart.json");
global.pet = require("./data/pet.json");
global.character = require("./data/character.json");
global.flyingPet = require("./data/flyingPet.json");
/********************************
 기본 헤더 설정
********************************/
app.disable("x-powered-by");
app.disable("etag");

/********************************
 JSON prettier :: 개발 기간 중에만 사용한다.
********************************/
app.set("json replacer", 0);
app.set("json spaces", 4);

/********************************
 각종 전처리 - 헤더 , Cookie , Body , CORS
********************************/
// Server Header
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    res.setHeader("Server", "dys");
    res.setHeader("Content-Language", "ko-KR");
    next();
});

/***************************************
 Body Parser
***************************************/
app.use((req, res, next) => {
    if (!req.headers["content-type"]) {
        next();
        return;
    }

    const content_headers = req.headers["content-type"].split(";")[0];
    if (["application/json", "application/x-www-form-urlencoded"].indexOf(content_headers) > -1) {
        req.headers["content-type"] = req.headers["content-type"].split(";")[0];
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
            data += chunk;
        });

        req.on("end", () => {
            req.body = data;
            next();
        });
    } else {
        next();
    }
});

app.use((req, res, next) => {
    if (!req.body) {
        next();
        return;
    }

    if (req.headers["content-type"] == "application/json") {
        try {
            req.body = JSON.parse(req.body);
            next();
        } catch (e) {
            console.error("파싱에러", e);
            res.json({
                "result": false,
                "msg": "JSON 파싱 에러"
            });
        }
    } else if (req.headers["content-type"] == "application/x-www-form-urlencoded") {
        req.body = querystring.parse(req.body);

        next();
    } else {
        next();
    }
});

/***************************************
 Options header 처리
***************************************/
app.use((req, res, next) => {
    if (req.headers.origin || req.method == "OPTIONS") {
        res.set("Access-Control-Allow-Credentials", true);
        res.set("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS,LINK");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        if (req.headers.origin) {
            res.set("Access-Control-Allow-Origin", req.headers.origin);
        }

        if (req.method == "OPTIONS") {
            res.send();
            return;
        }
    }
    next();
});

// Main Route
app.use(cookieParser());
app.use("/", require("./main"));

/***************************************
 404 Not Found
***************************************/
app.use((req, res) => {
    let errormsg = `404 Not Found\n - ${req.method} METHOD\n - FullURL : ${req.originalUrl}\n - Relative URL: ${req.url}`;

    if (req.header("Referer")) {
        errormsg += `- Referer : ${req.header("Referer")}`;
    }

    console.error(errormsg);
    res.status(404).json({
        "result": false,
        "code": 404,
        "msg": "page not found"
    });
});

/***************************************
 500 Internal Server Error
***************************************/
app.use((err, req, res, next) => {
    console.error(new Date(), err);
    res.status(500).json({
        "result": false,
        "code": "UNKNOWN_ERROR",
        "message": "알수 없는 에러입니다."
    });
});

/***************************************
 Logs
***************************************/
global.GetTimestring = () => {
    const _t = new Date();
    const lz = (e) => {
        return ("0" + e).slice(-2);
    };

    const _day = ["일", "월", "화", "수", "목", "금", "토"];

    return `${_t.getFullYear()}-${lz(_t.getMonth() + 1)}-${lz(_t.getDate())}(${_day[_t.getDay()]}) ${lz(_t.getHours())}:${lz(_t.getMinutes())}:${lz(_t.getSeconds())}`;
};

/********************************
 세팅
********************************/
(async () => {
    const appserver = app.listen(80, () => {
        console.log(`✓ HTTP Server listening start on port 80`);

        console.log(`Node Version: <${process.version}>`);
        console.log(`Pod Name: ${process.env.HOSTNAME}`);
    });

    /***************************************
     DB 관련
    ***************************************/

    global.sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.config);

    global.models = {};

    fs.readdirSync("./models")
        .filter((file) => {
            return file.indexOf(".") !== 0 && file.slice(-3) === ".js" && file !== "index.js";
        })
        .forEach((file) => {
            console.log(sequelize);
            console.log(file);
            const model = sequelize["import"]("models/" + file);
            models[model.name] = model;
        });
    require("./models")(models);
    const db_connect_result = await sequelize
        .sync({
            "logging": false
        })
        .then(() => {
            console.log("✓ MySQL connection success. ( with Sequelize ) / Season3");
            return true;
        })
        .catch((err) => {
            console.error(err);
            console.error("✗ MySQL connection failed / Season3");
            return false;
        });
    if (!db_connect_result) {
        setTimeout(() => {}, 5000);
        return;
    }

    /***************************************
     Readiness Handling
    ***************************************/
    const handle = (signal) => {
        console.log("------------------------");
        console.log(`${new Date()}`);
        console.log("Shutdown Signal: ", signal);
        console.log("waiting for %d sec to close server", WAIT_BEFORE_SERVER_CLOSE);

        setTimeout(() => {
            console.log("Close Server");
            appserver.close(() => {
                console.log("Exit - with Server Close");
                process.exit(0);
            });
        }, WAIT_BEFORE_SERVER_CLOSE * 1000);
    };

    process.on("SIGINT", handle);
    process.on("SIGTERM", handle);
})();
