const axios = require("axios");
const app = require("express")();
const cookieParser = require("cookie-parser");
const fs = require("fs");
//const models = require("../../models_baseball/models");
global.Sequelize = require("sequelize");
const Op = Sequelize.Op;
global.Op = Op;
models = {};

let requestID = 1;

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

/********************************
 세팅
********************************/
(async () => {
    const appserver = app.listen(8080, () => {
        console.log(`✓ HTTP Server listening start on port 8080`);

        console.log(`Node Version: <${process.version}>`);
        console.log(`Pod Name: ${process.env.HOSTNAME}`);
    });

    global.sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.config);

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
})();

app.use("/", (req, res, next) => {
    console.log(req);
    console.log("----------------Request Arrived--------------");
    console.log("Request <" + requestID + "> Method : " + req.method);
    console.log("Request Query:");
    console.log(req.query);
    console.log("---------------------------------------------\n\n");
    if (!req.query.userId) {
        return res.status(400).json({ error: "User ID required" });
    }

    requestID += 1;
    next();
});
app.get("/", async (req, res) => {
    let result;

    if (req.query.attribute) {
        result = await models.user.findOne(
            {
                attributes: [req.query.attribute]
            },
            {
                where: {
                    userId: req.query.userId
                }
            }
        );
    } else {
        result = await models.user.findOne({
            where: {
                userId: req.query.userId
            }
        });
    }

    if (!result) {
        return res.status(404).json({ error: "Not Found" });
    }

    res.json(result);
});

app.put("/", (req, res) => {
    const update = {};
    for (key of Object.keys(req.query)) {
        if (key == "userId") {
            continue;
        }
        update[key] = req.query[key];
    }
    models.user
        .update(update, {
            where: {
                userId: req.query.userId
            }
        })
        .then((response) => {
            res.send("updated" + JSON.stringify(update));
        })
        .catch((error) => {
            res.send(error.response.status);
        });
});

app.post("/", async (req, res) => {
    const userInfo = await models.user.findOne({
        where: {
            userId: req.query.userId
        }
    });

    if (userInfo) {
        res.send({ error: "User Already Exist : userId = " + req.query.userId });
        return;
    }

    await models.user
        .create({
            userId: req.query.userId,
            userTrace: JSON.stringify({})
        })
        .then((response) => {
            res.send("User Created : userId = " + req.query.userId);
        })
        .catch((error) => {
            res.send(error);
        });
});
