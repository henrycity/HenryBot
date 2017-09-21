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
        const isFinnish = franc(text) === 'fin';
        const simpleFinnishTerms = ['kiitos', 'moi', 'hyvää', 'onnea', 'hei'];
        let notSimpleFinnish = true;
        simpleFinnishTerms.forEach((term) => {
            if (text.toLowerCase().includes(term)) {
                return notSimpleFinnish = false;
            }
        });
        if (isFinnish && notSimpleFinnish) {
            const translatedText = (await translate(text, {to: 'en'})).text;
            const translatedReply = `${userFirstName} said "${translatedText}"`;
            const random = Math.floor((Math.random() * 5));
            const catchphrases = ["There is nothing to fear. Henry is here!",
                "Má éo hiểu con mẹ gì hết.",
                "Nói tiếng anh dùm cái",
                "Please don't make Tri use Google Translate again :slightly_frowning_face:",
                translatedReply];
            const reply = catchphrases[random];
            const currentTime = new Date();
            if (!lastRemindingTime) {
                lastRemindingTime = new Date();
            }
            const timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
            const canRemindAgain = timePassed >= 1;
            // if (remindingFirstTime || canRemindAgain) {
                if (thread_ts) {
                    rtm.send({
                        text: reply,
                        channel,
                        thread_ts,
                        type: RTM_EVENTS.MESSAGE,
                    });
                }
                else {
                    rtm.sendMessage(reply, channel);
                }
                remindingFirstTime = false;
            // }
        }
    }
});

rtm.start();
