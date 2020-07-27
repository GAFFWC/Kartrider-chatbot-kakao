const express = require("express");
const router = express.Router();

// user id 당 할당된 랜덤 숫자
const botChoice = {};

// user id 별 숫자야구 기록
const userRecord = {};

// user의 발화(숫자)와 봇이 가진 숫자 간 점수 계산
const CalculateScore = (userChoice, botChoice) => {
    let strike = 0,
        ball = 0,
        out = 0;

    for (const i of userChoice) {
        // 각 자릿수마다 존재하는지, 존재하면 어디에 위치하는지에 따라 strike, ball, out 계산
        const where = botChoice.indexOf(i);
        if (where < 0) out += 1;
        else if (where === userChoice.indexOf(i)) strike += 1;
        else ball += 1;
    }

    if (out === 4) return -1;

    return [strike, ball];
};
// 임의의 4자리 수 문자열을 반환
const getNumber = () => {
    let number = "";

    for (i = 0; i < 4; i++) number += Math.floor(Math.random() * 10);

    return number;
};
// 4자리 숫자의 각 자리가 중복되지 않을 때까지
const GetNewChoice = () => {
    let newChoice = getNumber();

    while (!CheckDuplicated(newChoice)) {
        newChoice = getNumber();
    }
    return newChoice;
};
// num의 각 자릿수가 중복되지 않게 들어가 있는지 체크
const CheckDuplicated = (num) => {
    let flag = 0;
    const check = {};
    for (const i of num) {
        // check[i]가 생성되어있으면 중복
        if (!check[i]) check[i] = 1;
        else {
            flag = 1;
            break;
        }
    }

    if (flag === 1) return false;

    return true;
};
// 게임 초기화 : 사용자별 숫자 및 기록 초기화
const InitGame = (userId) => {
    botChoice[userId] = GetNewChoice();
    userRecord[userId] = [];
};

// 기본 카카오값 체크
router.use((req, res, next) => {
    if (!req.body || !req.body.intent || !req.body.intent.id) {
        res.json(ErrorMessage("죄송합니다. 서버에 오류가 발생하였습니다. 나중에 다시 시도해주세요."));
        return;
    }

    if (!req.body.bot || !req.body.bot.id || !req.body.userRequest || !req.body.userRequest.user || !req.body.userRequest.user.id) {
        res.json(ErrorMessage("불완전한 요청입니다."));
        return;
    }

    next();
});

router.post("/game", (req, res) => {
    // 기본 발화 처리
    const userId = req.body.userRequest.user.id;
    const userText = req.body.userRequest.utterance;

    // 처음 시작하는 사용자라면 랜덤 숫자 하나 생성 및 게임 기록 준비
    if (!botChoice[userId]) InitGame(userId);
    //console.log(typeof userText);

    console.log("봇이 선택한 숫자 : " + botChoice[userId]);
    console.log("사용자 입력 : " + userText);

    let ErrorText;

    // 발화가 숫자가 아님
    if (!/^[0-9]*$/.test(userText)) ErrorText = "숫자가 아니에요!\n4자리 숫자를 말해주세요.";
    // 길이가 4보다 길다
    else if (userText.length > 4) ErrorText = "숫자의 길이가 너무 길어요.\n4자리 숫자를 입력해주세요.";
    // 길이가 4보다 짧다
    else if (userText.length < 4) ErrorText = "숫자의 길이가 너무 짧아요.\n4자리 숫자를 입력해주세요.";
    // 각 자릿수 중 중복되는 숫자가 있음
    else if (!CheckDuplicated(userText)) ErrorText = "숫자의 각 자릿수 중 중복되는 숫자가 있어요.\n각 자릿수가 중복되지 않도록 다시 입력해주세요.";

    if (ErrorText) {
        res.json(GameMessage(ErrorText));
        return;
    }

    // 모두 만족하는 경우 게임 진행
    res.json(PlayGame(userText, userId));
});
// 기록 보기 발화 처리
router.post("/record", (req, res) => {
    const userId = req.body.userRequest.user.id;
    const record = userRecord[userId];

    // 기록이 생성된 적 없거나 혹은 기록이 없는 경우
    if (!record || record.length === 0) {
        res.json(GameMessage("도전하신 기록이 없네요."));
        return;
    }

    // 기록을 메세지 뒤에 이어 붙임
    let description = "";
    for (const i of userRecord[userId]) description += i + "\n";

    res.json(GameMessage(description));
});
// 새 게임 시작 (숫자 정보 초기화)
router.post("/start", (req, res) => {
    const userId = req.body.userRequest.user.id;

    // 초기화 함수 호출
    InitGame(userId);
    res.json(GameMessage("새 게임을 시작합니다.\n4자리 숫자를 입력해주세요."));
});
// 이어 하기 (게임 진행 하다가 설명 보았다가 다시 이어할 수 있도록)
router.post("/continue", (req, res) => {
    const userId = req.body.userRequest.user.id;

    if (!botChoice[userId]) {
        // 이어할 게임 기록이 없는 경우 새 게임으로 시작
        InitGame(userId);
        res.json(GameMessage("진행하시던 게임이 없어 새로운 게임으로 시작합니다. 4자리 숫자를 입력해주세요."));
        return;
    }

    res.json(GameMessage("게임을 이어서 진행합니다. 4자리 숫자를 입력해주세요."));
});

router.post("/answer", (req, res) => {
    // 정답 보기
    const userId = req.body.userRequest.user.id;
    let AnswerMessage = "정답은 " + botChoice[userId] + "입니다. 새로운 게임을 원하시면 <새 게임 시작>을 눌러주세요.";

    if (!botChoice[userId]) AnswerMessage = "게임을 진행하신 적이 없어요. <새 게임 시작>을 눌러 게임을 시작해주세요";

    res.json(GameMessage(AnswerMessage));
});
const PlayGame = (userText, userId) => {
    // 게임 결과, 목숨 안내
    let score = CalculateScore(userText, botChoice[userId]);
    let description = "";

    if (score === -1) {
        // 아웃인 경우
        description = "아웃";
    } else if (score[0] === 4) {
        // 정답을 맞춘 경우 (Strike = 4)
        description = "정답입니다! 새로운 게임을 원하시면 <새 게임 시작>을 눌러주세요.";
        userRecord[userId].push('"' + userText + '"를 선택하여 정답을 맞추셨습니다.');
        return GameMessage(description);
    } else {
        description = score[0] + "S " + score[1] + "B";
    }

    // 게임 결과 및 목숨 정보 메시지 생성
    const gameMessage = GameMessage(description);
    userRecord[userId].push('"' + userText + '"의 결과는 ' + description);
    gameMessage["template"]["outputs"].push(LifeMessage(userId));

    return gameMessage;
};

const LifeMessage = (userId) => {
    // 목숨 관련 정보 제공
    const life = 10 - userRecord[userId].length;
    let description = "";

    description = life + "번의 기회가 남았습니다.\n 숫자를 입력해 주세요.";

    if (life === 0) {
        // 남은 기회가 없는 경우
        description = "10번의 기회가 모두 끝났습니다. 정답은 " + botChoice[userId] + "입니다.";
    }

    return {
        "simpleText": {
            "text": description
        }
    };
};
const GameMessage = (description) => {
    // 게임 결과 (첫번째 카드)
    const Msg = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": description
                    }
                }
            ]
        }
    };

    return AppendQuick(Msg);
};
const AppendQuick = (res) => {
    // 퀵버튼 붙여주기
    res["template"]["quickReplies"] = [
        {
            "action": "message",
            "label": "게임 설명",
            "messageText": "게임 설명"
        },
        {
            "action": "message",
            "label": "새 게임 시작",
            "messageText": "게임 시작"
        },
        {
            "action": "message",
            "label": "기록 보기",
            "messageText": "기록 보기"
        },
        {
            "action": "message",
            "label": "정답 보기",
            "messageText": "정답 보기"
        }
    ];

    return res;
};
const ErrorMessage = (description) => {
    // 카카오 기본 에러 메시지 출력
    return {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": description
                    }
                }
            ]
        }
    };
};
module.exports = router;
