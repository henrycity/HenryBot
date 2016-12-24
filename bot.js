var request = require('superagent');
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var bot_token = process.env.BOT_API_KEY || '';

var rtm = new RtmClient(bot_token);

rtm.on(RTM_EVENTS.MESSAGE, function(data) {
    var channel = data.channel;
    console.log(data);
    if ((channel[0] === 'C' || channel[0] === 'U') && !data.hasOwnProperty('subtype')) {
        var text = data.text;
        var API_URL = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages';
        var message = {"documents": [{"id": "string", "text": text}]};
        request.post(API_URL)
            .type('application/json')
            .set('Ocp-Apim-Subscription-Key', process.env.LANG_API_KEY)
            .send(message)
            .end(function(err, res){
                if (err || !res.ok) {
                    console.log("Error", err);
                } else {
                    var detection = res.body.documents[0].detectedLanguages[0];
                    var isFinnish = (detection.name === "Finnish" && detection.score > 0.8) 
                                    || text.includes('ä') || text.includes('ö');
                    if (isFinnish) {
                        rtm.sendMessage("Please speak English!", channel);
                    }
                }
            });
    }
});

rtm.start();
