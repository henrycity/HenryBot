'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var axios = require('axios');
var franc = require('franc');
var translate = require('google-translate-api');
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var user_token = process.env.USER_TOKEN;
var bot_token = process.env.BOT_API_KEY;

var rtm = new RtmClient(bot_token);
var lastRemindingTime = void 0;
var remindingFirstTime = true;

rtm.on(RTM_EVENTS.MESSAGE, function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
        var channel, thread_ts, user, text, request_url, userFirstName, isFinnish, simpleFinnishTerms, notSimpleFinnish, translatedText, translatedReply, random, catchphrases, reply, currentTime, timePassed, canRemindAgain;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        channel = data.channel, thread_ts = data.thread_ts, user = data.user, text = data.text;
                        request_url = 'https://slack.com/api/users.info?token=' + user_token + '&user=' + user;
                        _context.next = 4;
                        return axios.get(request_url);

                    case 4:
                        userFirstName = _context.sent.data.user.profile.first_name;

                        if (!((channel[0] === 'C' || channel[0] === 'U' || channel[0] === 'G') && !data.hasOwnProperty('subtype'))) {
                            _context.next = 24;
                            break;
                        }

                        isFinnish = franc(text) === 'fin';
                        simpleFinnishTerms = ['kiitos', 'moi', 'hyvää', 'onnea', 'hei'];
                        notSimpleFinnish = true;

                        simpleFinnishTerms.forEach(function (term) {
                            if (text.toLowerCase().includes(term)) {
                                return notSimpleFinnish = false;
                            }
                        });

                        if (!(isFinnish && notSimpleFinnish)) {
                            _context.next = 24;
                            break;
                        }

                        _context.next = 13;
                        return translate(text, { to: 'en' });

                    case 13:
                        translatedText = _context.sent.text;
                        translatedReply = userFirstName + ' said "' + translatedText + '"';
                        random = Math.floor(Math.random() * 5);
                        catchphrases = ["There is nothing to fear. Henry is here!", "Má éo hiểu con mẹ gì hết.", "Nói tiếng anh dùm cái", "Please don't make Tri use Google Translate again :slightly_frowning_face:", translatedReply];
                        reply = catchphrases[random];
                        currentTime = new Date();

                        if (!lastRemindingTime) {
                            lastRemindingTime = new Date();
                        }
                        timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
                        canRemindAgain = timePassed >= 1;
                        // if (remindingFirstTime || canRemindAgain) {

                        if (thread_ts) {
                            rtm.send({
                                text: reply,
                                channel: channel,
                                thread_ts: thread_ts,
                                type: RTM_EVENTS.MESSAGE
                            });
                        } else {
                            rtm.sendMessage(reply, channel);
                        }
                        remindingFirstTime = false;
                        // }

                    case 24:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());

rtm.start();
