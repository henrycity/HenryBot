const request = require('superagent');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const bot_token = process.env.BOT_API_KEY || '';

let rtm = new RtmClient(bot_token);
let lastRemindingTime;
let remindingFirstTime = true;

rtm.on(RTM_EVENTS.MESSAGE, function(data) {
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
            .end(function(err, res){
                if (err || !res.ok) {
                    console.log("Error", err);
                } else {
                    const detection = res.body.documents[0].detectedLanguages[0];
                    const isFinnish = (detection.name === "Finnish" && detection.score > 0.8);
                    const simpleFinnishTerms = ['kiitos', 'moi', 'hyvää synttää', 'hyvää synttäriä', 'hyvää syntymäpäivää', 'onnea'];
                    let notSimpleFinnish = true;
                    simpleFinnishTerms.forEach((term) => {
                        if (text.includes(term)) {
                            return notSimpleFinnish = false;
                        }
                    });
                    if (isFinnish && notSimpleFinnish) {
                        const random = Math.floor((Math.random() * 5));
                        let catchphrase = "";
                        switch (random) {
                            case 0:
                                catchphrase = "Tri is sad. Please speak English! #maketrihappyagain";
                                break;
                            case 1:
                                catchphrase = "Ei? Joo? Argghh, I cannot understand. Can you repeat that in English?";
                                break;
                            case 2:
                                catchphrase = "Tri maybe interested in joining the conversation? Can you say it again in English so that he can understand?";
                                break;
                            case 3: 
                                catchphrase = "Please don't make Tri use Google Translate again :(";
                                break;
                            case 4:
                                catchphrase = "Minä olen Henry. Minä don't speak Finnish.";
                                break;
                            default:
                                catchphrase = "Tri is sad. Please speak English! #maketrihappyagain";
                                break;
                        }
                        const currentTime = new Date();
                        if (!lastRemindingTime) {
                            lastRemindingTime = new Date();
                        }
                        const timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
                        const canRemindAgain = timePassed >= 1;
                        if (remindingFirstTime || canRemindAgain) {
                            if (thread_ts) {
	                            rtm.send({
		                            text: catchphrase,
		                            channel: channel,
		                            thread_ts: thread_ts,
		                            type: RTM_EVENTS.MESSAGE,
	                            });
                            }
                            else {
                                rtm.sendMessage(catchphrase, channel);
                            }
                            remindingFirstTime = false;
                        }
                    }
                }
            });
    }
});

rtm.start();
