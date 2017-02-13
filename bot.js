let request = require('superagent');
let RtmClient = require('@slack/client').RtmClient;
let RTM_EVENTS = require('@slack/client').RTM_EVENTS;

let bot_token = process.env.BOT_API_KEY || '';

let rtm = new RtmClient(bot_token);
let lastRemindingTime;
let remindingFirstTime = true;

rtm.on(RTM_EVENTS.MESSAGE, function(data) {
    let channel = data.channel;
    console.log(data);
    let thread_ts = data.thread_ts;
    if ((channel[0] === 'C' || channel[0] === 'U') && !data.hasOwnProperty('subtype')) {
        let text = data.text;
        let API_URL = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages';
        let message = {"documents": [{"id": "string", "text": text}]};
        request.post(API_URL)
            .type('application/json')
            .set('Ocp-Apim-Subscription-Key', process.env.LANG_API_KEY)
            .send(message)
            .end(function(err, res){
                if (err || !res.ok) {
                    console.log("Error", err);
                } else {
                    let detection = res.body.documents[0].detectedLanguages[0];
                    let isFinnish = (detection.name === "Finnish" && detection.score > 0.8);
                    let notSimpleFinnish = !text.includes('kiitos') || !text.includes('moi');
                    if (isFinnish && notSimpleFinnish) {
                        let random = Math.floor((Math.random() * 5));
                        let catchpharse = "";
                        switch (random) {
                            case 0:
                                catchpharse = "Tri is sad. Please speak English! #maketrihappyagain";
                                break;
                            case 1:
                                catchpharse = "Ei? Joo? Argghh, I cannot understand. Can you repeat that in English?";
                                break;
                            case 2:
                                catchpharse = "Tri maybe interested in joining the conversation? Can you say it again in English so that he can understand?";
                                break;
                            case 3: 
                                catchpharse = "Please don't make Tri use Google Translate again :(";
                                break;
                            case 4:
                                catchpharse = "Minä olen Henry. Minä don't speak Finnish.";
                                break;
                            default:
                                catchpharse = "Tri is sad. Please speak English! #maketrihappyagain";
                                break;
                        }
                        let currentTime = new Date();
                        if (!lastRemindingTime) {
                            lastRemindingTime = new Date();
                        }
                        let timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60);
                        let canRemindAgain = timePassed >= 0.5;
                        if (remindingFirstTime || canRemindAgain) {
                            if (thread_ts) {
	                            rtm.send({
		                            text: catchpharse,
		                            channel: channel,
		                            thread_ts: thread_ts,
		                            type: RTM_EVENTS.MESSAGE,
	                            });
                            }
                            else {
                                rtm.sendMessage(catchpharse, channel);
                            }
                            remindingFirstTime = false;
                        }
                    }
                }
            });
    }
});

rtm.start();
