'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var translateReply = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(text, userFirstName) {
        var translatedTextInEnglish, translatedTextInVN, translatedText;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return translate(text, { to: 'en' });

                    case 2:
                        translatedTextInEnglish = _context2.sent.text;
                        _context2.next = 5;
                        return translate(text, { to: 'vi' });

                    case 5:
                        translatedTextInVN = _context2.sent.text;
                        translatedText = Math.random() > 0.5 ? translatedTextInEnglish : translatedTextInVN;

                        console.log(Math.random() > 0.5, translatedText);
                        return _context2.abrupt('return', userFirstName + ' said "' + translatedText + '"');

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function translateReply(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
        var channel, thread_ts, user, text, request_url, userFirstName, replyBackInEnglish, translatedReply, reply;
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
                            _context.next = 14;
                            break;
                        }

                        if (!isFinnishAndNotSimple(text)) {
                            _context.next = 14;
                            break;
                        }

                        replyBackInEnglish = text.length > 20;
                        _context.next = 10;
                        return translateReply(text, userFirstName);

                    case 10:
                        translatedReply = _context.sent;
                        reply = catchphrase();

                        if (isAbleToReply(remindingFirstTime, lastRemindingTime)) {
                            sendMessage(thread_ts, reply, channel);
                            remindingFirstTime = false;
                        }
                        if (replyBackInEnglish) {
                            sendMessage(thread_ts, translatedReply, channel);
                        }

                    case 14:
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

function isFinnishAndNotSimple(text) {
    var isFinnish = franc(text) === 'fin';
    var simpleFinnishTerms = ['kiitos', 'kiitii', 'moi', 'hyvää', 'onnea', 'hei'];
    var notSimpleFinnish = true;
    simpleFinnishTerms.forEach(function (term) {
        if (text.toLowerCase().includes(term)) {
            return notSimpleFinnish = false;
        }
    });
    return isFinnish && (notSimpleFinnish || text.length > 20);
}

function isAbleToReply(remindingFirstTime, lastRemindingTime) {
    var currentTime = new Date();
    if (!lastRemindingTime) {
        lastRemindingTime = new Date();
    }
    var timePassed = Math.abs(currentTime - lastRemindingTime) / (1000 * 60 * 5);
    var canRemindAgain = timePassed >= 1;
    return remindingFirstTime || canRemindAgain;
}

function sendMessage(thread_ts, text, channel) {
    if (thread_ts) {
        rtm.send({
            text: text,
            channel: channel,
            thread_ts: thread_ts,
            type: RTM_EVENTS.MESSAGE
        });
    } else {
        rtm.sendMessage(text, channel);
    }
};

function catchphrase() {
    var random = Math.floor(Math.random() * 3);
    var catchphrases = ["There is nothing to fear. Henry is here!", "Huhu éo hiểu con mẹ gì hết. :crying_cat_face:", "Please don't make Tri use Google Translate again :slightly_frowning_face:"];
    return catchphrases[random];
}
