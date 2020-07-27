const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");

router.use(async (req, res, next) => {
    DataBase.SetUserInfo(req);

    if (req.body.userRequest.utterance == "메인 메뉴로" || req.body.intent.id == Block.welcome) {
        // 메인 메뉴 블록으로
        console.log("메인 메뉴로");
        Builder.MainMenuBlock(req, res);
        return;
    }

    // 라우팅 지정되서 들어온 경우 -> 퀵버튼 눌렀다
    if (req.body.action.clientExtra.title && req.body.action.clientExtra.subject) {
        console.log(req.body.action.clientExtra);
        req.body.userRequest.route = {
            title: req.body.action.clientExtra.title,
            subject: req.body.action.clientExtra.subject
        };
        DataBase.SetUserTrace(req);
    } else {
        // 버튼 눌렀던 것 아니면 DB에 저장된 마지막 라우트를 읽어옴
        let userTrace = await DataBase.GetUserTrace(req);

        if (userTrace) {
            req.body.userRequest.route = userTrace;
        }
    }
    next();
});

router.use(async (req, res, next) => {
    //console.log(req.body.userRequest.route);

    if (req.body.userRequest.route) {
        // 중간 어느 단계에서의 발화인 경우
        if (req.body.userRequest.route.title && req.body.userRequest.route.subject) {
            Builder.RoutingBlock(req, res, req.body.userRequest.route.title, req.body.userRequest.route.subject);
            return;
        } else {
            req.body.userRequest.route = {};
            req.Msg = "잘못된 접근입니다. 다시 시도해주세요.";
            req.ErrorMsg = "title, subject 없음";
            Builder.MainMenuBlock(req, res);
            return;
        }
    }

    next();
});
// 라우팅 되지 않은 발화들(폴백) -> 메인 메뉴로
router.use((req, res) => {
    Builder.MainMenuBlock(req, res);
});

module.exports = router;
