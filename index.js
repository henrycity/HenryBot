const axios = require('axios');
const franc = require('franc');
const translate = require('google-translate-api');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const user_token = process.env.USER_TOKEN;
const bot_token = process.env.BOT_API_KEY;

const rtm = new RtmClient(bot_token);

rtm.on(RTM_EVENTS.MESSAGE, async (data) => {
    const { channel, thread_ts, user, text } = data;
    const request_url = `https://slack.com/api/users.info?token=${user_token}&user=${user}`;
    const { is_bot, real_name } = (await axios.get(request_url)).data.user;
    if ((channel[0] === 'C' || channel[0] === 'U' || channel[0] === 'G') && !data.hasOwnProperty('subtype')) {
        if (!is_bot && isAbleToReply(text)) {
            const isAbleToReplyBackInEnglish = text.length > 20;
            const translatedReply = await translateReply(text, real_name);
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
    return `${userFirstName} said "${translatedTextInEnglish}"`;
}
