const request = require('superagent');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const bot_token = process.env.BOT_API_KEY || '';

const rtm = new RtmClient(bot_token);
let lastRemindingTime;
let remindingFirstTime = true;

rtm.on(RTM_EVENTS.MESSAGE, (data) => {
    const channel = data.channel;
    console.log(data);
    const thread_ts = data.thread_ts;
    if ((channel[0] === 'C' || channel[0] === 'U') && !data.hasOwnProperty('subtype')) {
        const text = data.text;
        const API_URL = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages';
        const message = {"documents": [{"id": "string", "text": text}]};
        request.post(API_URL)
            .type('application/json')
            .set('Ocp-Apim-Subscription-Key', process.env.LANG_API_KEY)
            .send(message)
            .end((err, res) => {
                if (err || !res.ok) {
                    console.log("Error", err);
                } else {
                    const detection = res.body.documents[0].detectedLanguages[0];
                    const isFinnish = (detection.name === "Finnish" && detection.score > 0.8);
                    const simpleFinnishTerms = ['kiitos', 'moi', 'hyvää', 'onnea', 'hei'];
                    let notSimpleFinnish = true;
                    simpleFinnishTerms.forEach((term) => {
                        if (text.toLowerCase().includes(term)) {
                            return notSimpleFinnish = false;
                        }
                    });
                    if (isFinnish && notSimpleFinnish) {
                        const random = Math.floor((Math.random() * 9));
                        const catchphrases = ["There is nothing to fear. Henry is here!",
                            "Má éo hiểu con mẹ gì hết.",
                            "Nói tiếng anh dùm cái",
                            "Tri is sad. Please speak English! #maketrihappyagain",
                            "Ei? Joo? Argghh, I cannot understand. Can you repeat that in English?",
                            "Tri maybe interested in joining the conversation? Can you say it again in English so that he can understand?",
                            "Please don't make Tri use Google Translate again :slightly_frowning_face:",
                            "Minä olen Henry. Minä don't speak Finnish.",
                            "Tri is sad. Please speak English! #maketrihappyagain"];
                        const reply = catchphrases[random];
                        const currentTime = new Date();
                        if (!lastRemindingTime) {
                            lastRemindingTime = new Date();
                        }
                        const timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
                        const canRemindAgain = timePassed >= 1;
                        if (remindingFirstTime || canRemindAgain) {
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
                        }
                    }
                }
            });
    }
});

rtm.start();
