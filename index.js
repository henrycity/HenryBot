const axios = require('axios');
const franc = require('franc');
const translate = require('google-translate-api');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const user_token = process.env.USER_TOKEN;
const bot_token = process.env.BOT_API_KEY;

const rtm = new RtmClient(bot_token);
let lastRemindingTime;
let remindingFirstTime = true;

rtm.on(RTM_EVENTS.MESSAGE, async (data) => {
    const { channel, thread_ts, user, text } = data;
    const request_url = `https://slack.com/api/users.info?token=${user_token}&user=${user}`;
    const userFirstName = (await axios.get(request_url)).data.user.profile.first_name;
    if ((channel[0] === 'C' || channel[0] === 'U' || channel[0] === 'G') && !data.hasOwnProperty('subtype')) {
        if (isAbleToReply(text)) {
            const isAbleToReplyBackInEnglish = text.length > 20;
            const translatedReply = await translateReply(text, userFirstName);
            const reply = catchphrase();
            if (isAbleToRemind(remindingFirstTime, lastRemindingTime)) {
                sendMessage(thread_ts, reply, channel);
                remindingFirstTime = false;
            }
            if (isAbleToReplyBackInEnglish) {
                sendMessage(thread_ts, translatedReply, channel);
            }
        }
    }
});

rtm.start();

function isAbleToReply(text) {
    const isFinnish = franc(text) === 'fin';
    const simpleFinnishTerms = ['kiitos', 'kiitii', 'moi', 'hyvää', 'onnea', 'hei'];
    let notSimpleFinnish = true;
    simpleFinnishTerms.forEach((term) => {
        if (text.toLowerCase().includes(term)) {
            return notSimpleFinnish = false;
        }
    });
    return isFinnish && (notSimpleFinnish || text.length > 20) && notOnlyHttpLink(text);
}

function notOnlyHttpLink(text) {
    return !(text.includes('http') && text.split(' ').length === 1);
}

function isAbleToRemind(remindingFirstTime, lastRemindingTime) {
    const currentTime = new Date();
    if (!lastRemindingTime) {
        lastRemindingTime = new Date();
    }
    const timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
    const canRemindAgain = timePassed >= 1;
    return remindingFirstTime || canRemindAgain;
}

function sendMessage(thread_ts, text, channel) {
    if (thread_ts) {
        rtm.send({
            text,
            channel,
            thread_ts,
            type: RTM_EVENTS.MESSAGE,
        });
    }
    else {
        rtm.sendMessage(text, channel);
    }
};

async function translateReply(text, userFirstName) {
    const translatedTextInEnglish = (await translate(text, {to: 'en'})).text;
    const translatedTextInVN = (await translate(text, {to: 'vi'})).text;
    const translatedText = Math.random() > 0.5 ? translatedTextInEnglish : translatedTextInVN;
    console.log(Math.random() > 0.5, translatedText);
    return `${userFirstName} said "${translatedText}"`;
}

function catchphrase() {
    const random = Math.floor((Math.random() * 3));
    const catchphrases = [
        "There is nothing to fear. Henry is here!",
        "Huhu éo hiểu con mẹ gì hết. :crying_cat_face:",
        "Please don't make Tri use Google Translate again :slightly_frowning_face:",
    ];
   return catchphrases[random];
}
