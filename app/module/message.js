// 기본 메시지
const BasicMessage = (description) => {
    return {
        version: "2.0",
        template: {
            outputs: [
                {
                    simpleText: {
                        text: description
                    }
                }
            ]
        }
    };
};
// 파라미터로 들어온 메시지 형식에 퀵버튼 붙여주기
const AppendButton = (message, items) => {
    if (!items) return message;

    message.template.quickReplies = [];

    for (item of items) {
        const button = {
            label: item.label
        };

        if (item.action == "text") {
            button.action = "message";
            button.messageText = item.text ? item.text : item.label;
        }
        if (item.action == "block") {
            button.action = "block";
            button.blockId = item.blockId;
        }
        if (item.action == "url") {
            //console.log(11111111);
            button.action = "webLink";
            button.webLinkUrl = item.url;
        }

        if (item.extra) button.extra = item.extra;

        message.template.quickReplies.push(button);
    }

    return message;
};
// 카드를 보내보자
const SendCard = (req, res, title, description, thumbnailUrl, buttons, quickButton) => {
    const card = {
        version: "2.0",
        template: {
            outputs: [
                {
                    basicCard: {
                        title: title,
                        description: description,
                        thumbnail: {
                            imageUrl: thumbnailUrl
                        },
                        buttons: buttons
                    }
                }
            ]
        }
    };

    if (quickButton) {
        res.json(AppendButton(card, quickButton));
        return;
    }

    res.json(card);
};
const Send = (req, res, description, quickButton, imageUrl, button) => {
    const message = AppendButton(BasicMessage(description), quickButton);

    //console.log("Message -> Send");
    //console.log(message.template.quickReplies);

    if (imageUrl) {
        message.template.outputs.push({
            simpleImage: {
                imageUrl: imageUrl,
                altText: "이미지"
            }
        });
    }

    if (button) {
        message.template.outputs.push(button);
    }
    //console.log(message);
    res.json(message);
};
module.exports = {
    Send: Send,
    SendCard: SendCard
};
