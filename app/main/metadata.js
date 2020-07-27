const axios = require("axios");
const cheerio = require("cheerio");

// 정보 조회 메뉴 블록
const MetaDataMenu = (req, res) => {
    req.body.userRequest.route = {
        title: "MetaData",
        subject: "MetaDataMenu"
    };

    // DB에 저장
    DataBase.SetUserTrace(req);

    Msg.Send(req, res, "조회하고자 하는 데이터 유형을 골라주세요.", [
        {
            label: "카트바디",
            action: "text",
            extra: {
                dataType: "kart",
                title: "MetaData",
                subject: "AskDataName"
            }
        },
        {
            label: "캐릭터",
            action: "text",
            extra: {
                dataType: "character",
                title: "MetaData",
                subject: "AskDataName"
            }
        },
        {
            label: "트랙",
            action: "text",
            extra: {
                dataType: "track",
                title: "MetaData",
                subject: "AskDataName"
            }
        },
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
};
// 원하는 정보 이름 받기
const AskDataName = (req, res) => {
    // 이전 블록에서 받아온 데이터 유형 (카트바디, 캐릭터, 트랙)을 받음
    if (!req.body.action.clientExtra.dataType) {
        req.body.userRequest.route = {};
        DataBase.SetUserTrace(req);
        Msg.Send(req, res, "잘못된 접근입니다.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        return;
    }

    req.body.userRequest.dataType = req.body.action.clientExtra.dataType;

    // 잘못 입력하였거나, 데이터가 없는 경우 다시 돌아가야함
    req.body.userRequest.route = {
        title: "MetaData",
        subject: "GetUserData"
    };

    // DB에 저장
    DataBase.SetUserDataType(req);
    DataBase.SetUserTrace(req);

    Msg.Send(req, res, "원하는 (카트바디, 캐릭터, 트랙)의 이름을 말해주세요.");
};
// 사용자 발화를 기반으로 db에서 정보 찾기
const GetUserData = async (req, res) => {
    // 사용자 발화
    const userDataName = req.body.userRequest.utterance;

    //console.log(11111111111111);
    // 데이터 타입
    const userDatatype = await DataBase.GetUserDataType(req);

    // 마지막으로 발화한 데이터 이름을 db에 저장
    req.body.userRequest.data = userDataName;
    DataBase.SetUserData(req);

    // 해쉬코드를 json에서 받아오기
    const userDataNameEncoded = GetDataNameEncoded(userDatatype, userDataName);

    // 데이터가 없는 경우
    if (!userDataNameEncoded) {
        Msg.Send(req, res, "해당 데이터가 없습니다. 다시 입력해주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        return;
    }

    // 카드 썸네일 url
    let imageUrl = "https://storage.googleapis.com/db_cobbyang/metadata/" + userDatatype + "/" + userDataNameEncoded + ".png";

    // 나무위키에서 해당 데이터 검색 url
    let namuWikiUrl = "https://namu.wiki/w/" + encodeURI(userDataName);

    Msg.SendCard(
        req,
        res,
        userDataName,
        userDataName + "에 대한 정보입니다.",
        imageUrl,
        [
            {
                action: "webLink",
                label: "나무위키 - " + userDataName,
                webLinkUrl: namuWikiUrl
            }
        ],
        [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]
    );
};
// global json에서 해쉬 코드 찾기
const GetDataNameEncoded = (dataType, dataName) => {
    // 타입 이름에 맞게 list 지정
    let dbList;
    if (dataType == "kart") {
        dbList = kart;
    } else if (dataType == "character") {
        dbList = character;
    } else if (dataType == "track") {
        dbList = track;
    }

    //console.log(typeof dbList);

    // for문 스캔으로 직접 찾기
    let dataNameEncoded;
    for (info of dbList) {
        if (info.name == dataName) {
            dataNameEncoded = info.id;
            break;
        }
    }
    return dataNameEncoded;
};
module.exports = {
    MetaDataMenu: MetaDataMenu,
    AskDataName: AskDataName,
    GetUserData: GetUserData
};
