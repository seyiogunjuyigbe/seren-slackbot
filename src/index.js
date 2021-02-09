
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require("@slack/interactive-messages")
const { WebClient } = require('@slack/web-api');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const { createServer } = require("http")
const port = process.env.PORT || PORT || 3000;
const port2 = 4000;

const web = new WebClient(BOT_USER_TOKEN);
const slackEvents = createEventAdapter(SIGNING_SECRET);
const slackInteractions = createMessageAdapter(SIGNING_SECRET);
const app = express();

app.use('/slack/events', slackEvents.requestListener());
app.use("/callback", slackInteractions.requestListener())
app.use(
  bodyParser.json({
    limit: '5mb',
    type: 'application/json',
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '5mb',
    extended: true,
  })
);

app.use(function (req, res, next) {
  console.log({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  })
  next()
})
slackEvents.on('app_mention', async (event) => {
  console.log(`Received a mention event`);
  try {
    await web.chat.postMessage({
      channel: event.channel,
      blocks: [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": `Welcome <@${event.user}>. How are you doing?`,
            "emoji": true
          }
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "static_select",
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Doing Well"
                  },
                  "value": "doing-well"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Neutral"
                  },
                  "value": "neutral"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Feeling Lucky"
                  },
                  "value": "lucky"
                }
              ]
            }
          ]
        }
      ]
    });
    slackInteractions.action({ type: 'static_select' }, (payload, respond) => {
      console.log('new payload', payload);
    });

  } catch (error) {
    console.log(error);
  }
});
app.post("/callback", (req, res) => {
  console.log({ body })
  res.json(req.body)
})
app.post("/slack/events", (req, res) => {
  res.json(req.body)
})
slackEvents.on('message.im', async (event) => {
  console.log(`Received a DM event`);
  console.log({ event, block: event.blocks })

});

const server = createServer(app);

server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`);
});
