const axios = require("axios");
//const cheerio = require("cheerio");

// 정보 조회 메뉴 블록
const MetaDataMenu = (req, res) => {
    // DB에 저장
    DataBase.SetUserInfo(req, {
        userTrace: {
            title: "MetaData",
            subject: "MetaDataMenu"
        }
    });

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
        Msg.Send(req, res, "잘못된 접근입니다.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        DataBase.SetUserInfo(req, {
            userTrace: {}
        });
        return;
    }

    // DB에 저장
    DataBase.SetUserDataType(req);
    DataBase.SetUserTrace(req);

    DataBase.SetUserInfo(req, {
        userDataType: req.body.action.clientExtra.dataType,
        userTrace: {
            title: "MetaData",
            subject: "GetUserData"
        }
    });

    Msg.Send(req, res, "원하는 (카트바디, 캐릭터, 트랙)의 이름을 말해주세요.");
};
// 사용자 발화를 기반으로 db에서 정보 찾기
const GetUserData = async (req, res) => {
    // 사용자 발화
    const userDataName = req.body.userRequest.utterance;

    //console.log(11111111111111);
    // 데이터 타입
    const userDatatype = await DataBase.GetUserInfo(req, "userDataType");

    // 마지막으로 발화한 데이터 이름을 db에 저장
    DataBase.SetUserInfo(req, {
        userData: userDataName
    });
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

    const buttons = [
        {
            action: "webLink",
            label: "나무위키 - " + userDataName,
            webLinkUrl: namuWikiUrl
        }
    ];

    let youtubeSearchResults = await GetYoutubeSearchResults(userDataName);

    if (youtubeSearchResults.status == 200) {
        //console.log(youtubeSearchResults);

        for (i = 0; i < 2; i++) {
            const channelTitle = youtubeSearchResults.data.items[i].snippet.channelTitle;
            const videoUrl = "https://www.youtube.com/watch?v=" + youtubeSearchResults.data.items[i].id.videoId;

            buttons.push({
                action: "webLink",
                label: "리뷰 - " + channelTitle,
                webLinkUrl: videoUrl
            });
        }
    } else {
        console.log(youtubeSearchResults.status);
    }
    Msg.SendCard(req, res, userDataName, userDataName + "에 대한 정보입니다.", imageUrl, buttons, [
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
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
const GetYoutubeSearchResults = async (DataForSearch) => {
    const apiKey = "AIzaSyBBkRnJkkKb1MKuSsa4N0B9EZJo9P_CpwI";
    //const url = "https://www.googleapis.com/youtube/v3/search";

    const url = "https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&part=snippet&q=" + encodeURI("카트라이더 " + DataForSearch + " 리뷰");
    let searchResults = {};
    await axios({
        url: url,
        method: "GET",
        headers: {}
    })
        .then((response) => {
            //console.log(response);
            searchResults.status = response.status;
            searchResults.data = response.data;
        })
        .catch((error) => {
            console.log(error);
            //searchResults.status = error.response.status;
        });

    return searchResults;
    const videoUrl = "https://www.youtube.com/watch?v=PxWAot5Lbe8";
};

module.exports = {
    MetaDataMenu: MetaDataMenu,
    AskDataName: AskDataName,
    GetUserData: GetUserData
};
