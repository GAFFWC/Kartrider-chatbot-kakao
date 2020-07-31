// 라이더 통계 진입 -> 라이더 명 물어보기
// *** 블록 id로 연결하면 라우팅 빼도되는(빼야되는) 부분 있는듯

const { response } = require("express");
const axios = require("axios");
const { DatabaseError } = require("sequelize/types");

const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiMzAyMDUzODU3IiwiYXV0aF9pZCI6IjIiLCJ0b2tlbl90eXBlIjoiQWNjZXNzVG9rZW4iLCJzZXJ2aWNlX2lkIjoiNDMwMDExMzkzIiwiWC1BcHAtUmF0ZS1MaW1pdCI6IjUwMDoxMCIsIm5iZiI6MTU5NTMyNTA0MSwiZXhwIjoxNjEwODc3MDQxLCJpYXQiOjE1OTUzMjUwNDF9.17RBNQbfY30-idjYb1VAZtYvzkDs03n9gbLZM2jNCa4";

const testNickName = "양원춘";

// 넥슨 api 통신 검사
// *** 나중에 에러 코드 별로 케이스 나누어야함
const CheckApi = async (riderName) => {
    const url = "https://api.nexon.co.kr/kart/v1.0/users/nickname/" + encodeURI(riderName);
    let checkApi = {};

    // axios로 request 날리기
    await axios({
        url: url,
        method: "GET",
        headers: {
            "Authorization": apiKey
        }
    })
        .then((response) => {
            //console.log(response.status);
            //console.log(response.data);
            checkApi.status = response.status;
            if (response.status == 200) {
                // 해당 라이더 찾은 경우 접근 id를 지정해줌
                checkApi.accessId = response.data.accessId;
            }
        })
        .catch((error) => {
            // 에러
            console.log(error);
            checkApi.status = error.response.status;
        });

    return checkApi;
};
// api 통신 검사 후 라이더 명 입력 요청 발화
const AskRiderName = async (req, res) => {
    let checkApi = await CheckApi(testNickName);

    //console.log(checkApi);

    // api 통신 에러
    if (checkApi.status != 200) {
        req.body.userRequest.route = {};
        Msg.Send(req, res, "오류가 발생하였습니다. 잠시 후 다시 시도해주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        return;
    }

    // api 통신 성공

    // 라이더 못찾으면 다시 돌아갈 수 있게 라우팅 저장
    req.body.userRequest.route = {
        title: "Info",
        subject: "RiderInfoMenu"
    };

    Msg.Send(req, res, "라이더 명을 입력해주세요.", [
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);

    DataBase.SetUserInfo(req, {
        userTrace: req.body.userRequest.route
    });
};
// 입력받은 라이더 명을 통해 api 요청 후 처리
const RiderInfoMenu = async (req, res) => {
    let userLastRoute = await DataBase.GetUserTrace(req);

    // 라우트 조회 에러
    if (!userLastRoute || userLastRoute.title != req.body.userRequest.route.title || userLastRoute.subject != req.body.userRequest.route.subject) {
        console.log("여기서 error - RiderInfoMenu - 1");
        Msg.Send(req, res, "오류가 발생하였습니다. 잠시 후 다시 시도해주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        req.body.userRequest.route = {};
        DataBase.SetUserInfo(req, {
            userTrace: {}
        });
        return;
    }

    const riderName = req.body.userRequest.utterance;

    let checkApi = await CheckApi(riderName);

    // api 통신 에러
    if (checkApi.status != 200) {
        // 라이더 없음
        if (checkApi.status == 404) {
            Msg.Send(req, res, "해당 라이더를 찾지 못했습니다. 다시 입력해주세요.", [
                {
                    label: "메인 메뉴로",
                    action: "text"
                }
            ]);
        }
        // 기타 에러
        else {
            Msg.Send(req, res, "오류가 발생하였습니다. 잠시 후 다시 시도해주세요.", [
                {
                    label: "메인 메뉴로",
                    action: "text"
                }
            ]);
            req.body.userRequest.route = {};
            DataBase.SetUserInfo(req, {
                userTrace: {}
            });
        }
        return;
    }

    // 라이더 조회 성공

    req.body.userRequest.route = {
        title: "Info",
        subject: "GetGameType"
    };

    DataBase.SetUserInfo(req, {
        userAccessId: checkApi.accessId,
        userRiderName: riderName,
        userTrace: req.body.userRequest.route
    });

    Msg.Send(req, res, "현재 제공되는 기능은 아래와 같습니다. 원하는 기능의 버튼을 눌러주세요.", [
        {
            label: "최근 전적 및 통계",
            action: "text",
            extra: {
                title: "Info",
                subject: "GetGameType"
            }
        },
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
};
// 조회하고자 하는 게임 타입을 입력 받음
const GetGameType = (req, res) => {
    Msg.Send(req, res, "게임 유형을 골라주세요.", [
        {
            label: "아이템 개인전",
            action: "text",
            extra: {
                gameType: "ItemSolo",
                title: "Info",
                subject: "GetGameAmount"
            }
        },
        {
            label: "아이템 팀전",
            action: "text",
            extra: {
                gameType: "ItemTeam",
                title: "Info",
                subject: "GetGameAmount"
            }
        },
        {
            label: "스피드 개인전",
            action: "text",
            extra: {
                gameType: "SpeedSolo",
                title: "Info",
                subject: "GetGameAmount"
            }
        },
        {
            label: "스피드 팀전",
            action: "text",
            extra: {
                gameType: "SpeedTeam",
                title: "Info",
                subject: "GetGameAmount"
            }
        },
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
};
// 조회하고자 하는 게임 수를 발화로 입력 받음
const GetGameAmount = (req, res) => {
    // 전 블록에서 게임 유형 안가져 온 경우
    if (!req.body.action.clientExtra.gameType) {
        req.body.userRequest.route = {};
        DataBase.SetUserInfo(req, {
            userTrace: {}
        });
        Msg.Send(req, res, "잘못된 접근입니다.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        return;
    }

    // 게임 유형 db에 저장
    // 입력 정상적으로 받을 때까지 돌기위해 라우팅 저장
    req.body.userRequest.route = {
        title: "Info",
        subject: "GetGameResults"
    };
    DataBase.SetUserInfo(req, {
        userGameType: req.body.action.clientExtra.gameType,
        userTrace: req.body.userRequest.route
    });

    Msg.Send(req, res, "최근 1 ~ 500건까지 조회가 가능합니다. 원하는 게임 수를 입력해주세요. 플레이한 총 게임 수가 입력하신 게임 수보다 적을 경우 총 게임 수 까지만 조회합니다. 또한 500이 넘는 숫자를 입력하신 경우 최대 500건까지만 조회합니다.", [
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
};

// 입력 받은 게임 수 만큼 api로 요청
const GetGameResults = async (req, res) => {
    const gameAmount = req.body.userRequest.utterance;
    let gameResults;

    // 숫자가 아님
    if (!/^[0-9]*$/.test(gameAmount) || gameAmount == 0) {
        Msg.Send(req, res, "1 ~ 500까지의 올바른 숫자를 입력해 주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        return;
    }

    // 숫자긴 하지만 500을 넘는 숫자를 입력한 경우
    if (gameAmount > 500) gameAmount = 500;

    // 발화 숫자 (게임 수)를 req에 실어서 db로 저장
    DataBase.SetUserInfo(req, {
        userGameAmount: gameAmount
    });

    // 게임 결과 api 요청
    gameResults = await RequestGameResults(req, res);

    // 데이터 조회 에러인 경우
    if (gameResults.status != 200) {
        Msg.Send(req, res, "오류가 발생하였습니다. 잠시 후 다시 시도해주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        req.body.userRequest.route = {};
        DataBase.SetUserInfo(req, {
            userTrace: {}
        });
        return;
    }

    // 데이터 조회 성공
    const refinedGameResults = await RefineGameResults(gameResults.data.matches[0].matches);

    // 메시지 텍스트 만드는 과정
    let description = "조회된 게임 수 : " + gameAmount + "\n";
    description += "전체 게임 결과 입니다.\n";

    // 등수는 3등까지만 보여준다
    for (i = 0; i < 3; i++) {
        description += i + 1 + "등 : " + refinedGameResults.record[i] + "회 하셨습니다.\n";
    }

    description += "\n다음은 카트바디 별 게임 결과 입니다.\n\n";

    // 카트바디별로 1, 2, 3등 한 결과만
    for (kartName of Object.keys(refinedGameResults.recordByKart)) {
        const decodedKartName = FindKartName(kartName);
        if (decodedKartName) {
            const record = refinedGameResults.recordByKart[kartName];
            description += decodedKartName + "으로는 1등 " + record[0] + "회, 2등 " + record[1] + "회, 3등 " + record[2] + "회를 하셨습니다.\n";
        }
    }

    description += "\n다음은 트랙 별 게임 결과 입니다.\n\n";

    // 트랙별로 1, 2, 3등 한 결과만
    for (trackName of Object.keys(refinedGameResults.recordByTrack)) {
        const decodedTrackName = FindTrackName(trackName);
        if (decodedTrackName) {
            const record = refinedGameResults.recordByTrack[trackName];
            description += decodedTrackName + "에서는 1등 " + record[0] + "회, 2등 " + record[1] + "회, 3등 " + record[2] + "회를 하셨습니다.\n";
        }
    }

    Msg.Send(req, res, description, [
        {
            label: "메인 메뉴로",
            action: "text"
        }
    ]);
};
// 게임 결과 분석
const RefineGameResults = async (gameResults) => {
    const refinedGameResults = {
        record: [0, 0, 0], // 1, 2, 3등 몇번 했는가
        recordByKart: {}, // 이 카트 타고는 1, 2, 3등 몇번
        recordByTrack: {} // 이 트랙에서는 1, 2, 3등 몇번
    };

    // 카트라이더 api response 읽어가면서 등수에 기록하기
    for (match of gameResults) {
        const place = Number(match.player.matchRank);
        const usedKart = match.player.kart;
        const usedTrack = match.trackId;

        if (1 <= place && place <= 3) {
            refinedGameResults.record[place - 1] += 1;

            if (!refinedGameResults.recordByKart[usedKart]) {
                refinedGameResults.recordByKart[usedKart] = [0, 0, 0];
            }
            refinedGameResults.recordByKart[usedKart][place - 1] += 1;

            if (!refinedGameResults.recordByTrack[usedTrack]) {
                refinedGameResults.recordByTrack[usedTrack] = [0, 0, 0];
            }
            refinedGameResults.recordByTrack[usedTrack][place - 1] += 1;
        }
    }
    return refinedGameResults;
};
// 트랙 한글 이름 찾기
const FindTrackName = (key) => {
    let trackName;
    for (info of track) {
        if (info.id == key) {
            trackName = info.name;
            break;
        }
    }
    return trackName;
};
// 카트바디 한글 이름 찾기
const FindKartName = (key) => {
    let kartName;
    for (info of kart) {
        if (info.id == key) {
            kartName = info.name;
            break;
        }
    }

    return kartName;
};
// 넥슨에 request 날리기
const RequestGameResults = async (req, res) => {
    let url,
        gameResults = {};

    let userInfo = await Database.GetUserInfo(req);

    //console.log(userInfo);

    // db에 필수사항 기록되지 않은 경우
    if (!userInfo || !userInfo.userGameType || !userInfo.userGameAmount) {
        Msg.Send(req, res, "오류가 발생하였습니다. 잠시 후 다시 시도해주세요.", [
            {
                label: "메인 메뉴로",
                action: "text"
            }
        ]);
        req.body.userRequest.route = {};
        DataBase.SetUserInfo(req, {
            userTrace: {}
        });
        return;
    }

    // 특정 유저 조회일 경우
    if (userInfo.userAccessId) {
        url = "https://api.nexon.co.kr/kart/v1.0/users/" + userInfo.userAccessId + "/matches?start_date=&end_date= &offset=0&limit=" + userInfo.userGameAmount + "&match_types=" + gameTypes[userInfo.userGameType];

        // axios로 request 날리기
        await axios({
            url: url,
            method: "GET",
            headers: {
                "Authorization": apiKey
            }
        })
            .then((response) => {
                //console.log(response);
                gameResults.status = response.status;
                gameResults.data = response.data;
            })
            .catch((error) => {
                gameResults.status = error.response.status;
            });
    }

    return gameResults;
};
module.exports = {
    GetGameAmount: GetGameAmount,
    GetGameResults: GetGameResults,
    GetGameType: GetGameType,
    RiderInfoMenu: RiderInfoMenu,
    AskRiderName: AskRiderName
};
