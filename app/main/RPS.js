const express = require("express");
const router = express.Router();

const choiceField = {
    "가위": 0,
    "바위": 1,
    "보": 2
};

const totalResult = {};
const reverseField = ["가위", "바위", "보"];

const battle = [
    [0, -1, 1],
    [1, 0, -1],
    [-1, 1, 0]
];

const description = ["패배하셨습니다..별로 못하시네요.. ㅋㅋㅋ\n", "오.. 비겼습니다. 좀 하시네요 ㅎㅎ;\n", "제가 졌네요..\n"];

function makeMessage(botChoice, battleResult) {
    console.log("봇이 " + reverseField[botChoice] + "를 선택하였습니다.");
    //console.log(description[battleResult + 1]);
    return (ret = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": reverseField[botChoice] + "!\n" + description[battleResult + 1],
                        "buttons": [
                            {
                                "label": "다시 한 판?",
                                "action": "block",
                                "blockId": "5f0ec5425a5f930001664a6a"
                                //"action": "message",
                                //"messageText": "다시 한 판?"
                            },
                            {
                                "label": "그만할래요",
                                "action": "message",
                                "messageText": "그만할래요"
                            },
                            {
                                "label": "내 전적 좀 알려줘",
                                "action": "message",
                                "messageText": "내 전적 좀 알려줘"
                            }
                        ]
                    }
                }
            ]
        }
    });
}
router.post("/game", async (req, res) => {
    const userId = req.body.userRequest.user.id;
    const choice = req.body.userRequest.utterance;
    const userChoice = choiceField[choice];
    const botChoice = Math.floor(Math.random() * 3);
    //console.log(botChoice);
    const battleResult = battle[userChoice][botChoice];

    if (!totalResult[userId]) {
        totalResult[userId] = [0, 0, 0];
    }
    totalResult[userId][battleResult + 1] += 1;
    //console.log(botChoice);
    console.log("사용자가 " + choice + "를 선택하였습니다.");
    console.log("반응한 블록의 id는 : " + req.body.userRequest.block.id);

    res.json(makeMessage(botChoice, battleResult));
});

router.post("/result", (req, res) => {
    const userId = req.body.userRequest.user.id;
    if (!totalResult[userId]) {
        totalResult[userId] = [0, 0, 0];
    }
    res.json({
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "description": "사용자님의 전적은 " + String(totalResult[userId][2]) + "승 " + String(totalResult[userId][1]) + "무 " + String(totalResult[userId][0]) + "패 입니다.",
                        "buttons": [
                            {
                                "label": "다시 한 판?",
                                "action": "block",
                                "blockId": "5f0ec5425a5f930001664a6a"
                                //"action": "message",
                                //"messageText": "다시 한 판?"
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
module.exports = router;
