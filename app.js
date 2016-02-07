'use strict';

const Botkit = require('botkit');
const SLACK_TOKEN = process.env.SLACK_TOKEN;

if (!SLACK_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const controller = Botkit.slackbot({
  debug: true
});

controller.spawn({
  token: SLACK_TOKEN
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'Hello yourself.');
});

controller.hears(['start'], ['ambient'], (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.ask('Are you sure?(yes/no)', [
      {
        pattern: bot.utterances.yes,
        callback: (response, convo) => {
          convo.say('Start!');
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        callback: (response, convo) => {
          convo.say('Quit!');
          convo.next();
        }
      },
      {
        default: true,
        callback: (response, convo) => {
          convo.say("Please type of 'yes' or 'no'.");
          convo.repeat();
          convo.next();
        }
      }
    ])
  });
});

const port = 3000;
controller.setupWebserver(port, (err, webserver) => {
  webserver.get('/ping', (req, res) => {
    controller.log("pong!");
    res.send('pong!');
  });

  // [POST] /slack/receiveの追加
  // Outgoing Webhooks や Slash commands の時に使う
  controller.createWebhookEndpoints(webserver);
});

