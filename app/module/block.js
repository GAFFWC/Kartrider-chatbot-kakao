//const request = require("request-promise-native");
const Info = require("../main/info.js");
const MetaData = require("../main/metadata.js");
//const Metadata = require("../main/metadata.js");
// title, subject를 기준으로 다른 파일로 넘김
const RoutingBlock = (req, res, title, subject) => {
    const ErrorText = "잘못된 접근입니다. 메인메뉴로 돌아갑니다.";

    if (title == "Info") {
        // title, subject에 맞는 함수가 있는지 검사
        if (!Info[subject]) {
            console.log("매칭되는 함수 없음 : " + title + subject);
            req.body.userRequest.route = {}; // route 초기화
            Msg.Send(req, res, ErrorText, [
                {
                    label: "메인 메뉴로",
                    action: "text"
                }
            ]);
        } else {
            Info[subject](req, res);
        }
    }

    if (title == "MetaData") {
        // title, subject에 맞는 함수가 있는지 검사
        if (!MetaData[subject]) {
            console.log("매칭되는 함수 없음 : " + title + subject);
            req.body.user.route = {}; // route 초기화
            Msg.Send(req, res, ErrorText, [
                {
                    label: "메인 메뉴로",
                    action: "text"
                }
            ]);
        } else {
            MetaData[subject](req, res);
        }
    }
};
// 메인 메뉴 블록
const MainMenuBlock = (req, res) => {
    const mainText = "메인 메뉴 중 원하는 기능을 눌러주세요.\n\n<라이더 통계> : 특정 라이더의 정보 및 통계\n<정보 조회> : 카트라이더 게임 내 카트바디, 캐릭터, 트랙에 대한 정보 조회";

    req.body.userRequest.route = {};

    // route 초기화
    DataBase.SetUserTrace(req);

    Msg.Send(req, res, mainText, [
        {
            label: "라이더 통계",
            action: "text",
            extra: {
                title: "Info",
                subject: "AskRiderName"
            }
        },
        {
            label: "정보 조회",
            action: "text",
            extra: {
                title: "MetaData",
                subject: "MetaDataMenu"
            }
        }
    ]);
};

module.exports = {
    // 블록 라우팅 -> 다른 파일로 넘김
    RoutingBlock: RoutingBlock,
    // 메인 메뉴
    MainMenuBlock: MainMenuBlock
};
