const express = require("express");
const router = express.Router();

const userDic = {};

//var botChoice = Math.floor(Math.random() * 1000);
function Calculate(userChoice, botChoice) {
    var strike = 0,
        ball = 0,
        out = 0;

    const user = userChoice.toString();
    const bot = botChoice.toString();

    for (i = 0; i < 4; i++) {
        const where = bot.indexOf(user[i]);
        if (where < 0) out += 1;
        else if (where === i) strike += 1;
        else ball += 1;
    }

    if (out === 4) return -1;

    return [strike, ball];
}
function ResetBotChoice(userId) {
    var temp = Math.floor(Math.random() * 10000);
    while (!CheckDuplicated(String(temp))) {
        temp = Math.floor(Math.random() * 10000);
    }
    userDic[userId] = temp;
}
function CheckDuplicated(num) {
    var check = {};
    for (i = 0; i < 4; i++) {
        if (!check[num[i]]) check[num[i]] = 1;
        else return false;
    }
    return true;
}
router.post("/game", (req, res) => {
    const userId = req.body.userRequest.user.id;
    const userText = req.body.userRequest.utterance;

    if (!userDic[userId]) ResetBotChoice(userId);

    console.log("봇이 선택한 숫자 : " + userDic[userId]);
    console.log("사용자 입력 : " + userText);

    if (!/^[1-9]{4}$/.test(userText) || !CheckDuplicated(userText)) {
        res.json(MakeMessage(-2));
        return;
    }

    res.json(MakeMessage(Calculate(Number(userText), userDic[userId])));
});

function MakeMessage(gameResult) {
    var message = "";

    if (gameResult === -2) message = "1부터 9까지의 숫자로 이루어진 4자리 수 중 각 자리가 중복되지 않는 수를 입력해주세요.";
    else if (gameResult === -1) message = "아웃";
    else message = gameResult[0] + "S " + gameResult[1] + "B";

    return {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": message,
                        "buttons": [
                            {
                                "label": "정답 보기",
                                //"action": "block",
                                //"blockId": "5f0ec5425a5f930001664a6a"
                                "action": "message",
                                "messageText": "정답 보기"
                            },
                            {
                                "label": "정답 리셋",
                                "action": "message",
                                "messageText": "정답 리셋"
                            },
                            {
                                "label": "그만할래요",
                                "action": "message",
                                "messageText": "그만할래요"
                            }
                        ]
                    }
                }
            ]
        }
    };
}
router.post("/reset", (req, res) => {
    const userId = req.body.userRequest.user.id;
    ResetBotChoice(userId);

    res.json({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": "정답 숫자가 리셋되었습니다.",
                        "buttons": [
                            {
                                "label": "게임 시작",
                                //"action": "block",
                                //"blockId": "5f0ec5425a5f930001664a6a"
                                "action": "message",
                                "messageText": "게임 시작"
                            },
                            {
                                "label": "그만할래요",
                                "action": "message",
                                "messageText": "그만할래요"
                            }
                        ]
                    }
                }
            ]
        }
    });
});

router.post("/show", (req, res) => {
    const userId = req.body.userRequest.user.id;
    const temp = userDic[userId];
    ResetBotChoice(userId);
    res.json({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": "정답은 " + temp + "이었습니다.\n정답을 리셋합니다.",
                        "buttons": [
                            {
                                "label": "새 게임 시작",
                                //"action": "block",
                                //"blockId": "5f0ec5425a5f930001664a6a"
                                "action": "message",
                                "messageText": "게임 시작"
                            },
                            {
                                "label": "그만할래요",
                                "action": "message",
                                "messageText": "그만할래요"
                            }
                        ]
                    }
                }
            ]
        }
    });
});

router.post("/bye", (req, res) => {
    const userId = req.body.userRequest.user.id;
    ResetBotChoice(userId);
    res.json({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": "다음에 또 이용해주세요.",
                        "buttons": [
                            {
                                "label": "게임 시작",
                                //"action": "block",
                                //"blockId": "5f0ec5425a5f930001664a6a"
                                "action": "message",
                                "messageText": "게임 시작"
                            }
                        ]
                    }
                }
            ]
        }
    });
});
module.exports = router;
