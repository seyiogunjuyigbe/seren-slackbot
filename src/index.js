
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require("@slack/interactive-messages")
const { WebClient } = require('@slack/web-api');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const { createServer } = require("http");
const Response = require("./models/response")
const app = express();
const DB = require("./database")
const port = process.env.PORT || PORT || 3000;
new DB().connect(DB_URL);

const web = new WebClient(BOT_USER_TOKEN);
const slackEvents = createEventAdapter(SIGNING_SECRET);
const slackInteractions = createMessageAdapter(SIGNING_SECRET);


app.use(require("./routes"))
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
app.all("*", (req, res) => {
  return res.status(404).json({
    message: "requested route not found",
    data: null
  })
})

// event listeners
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
    slackInteractions.action({ type: 'static_select' }, async (payload, respond) => {
      console.log({ payload })
      try {
        let newResponse = await Response.create({
          username: payload.user.username,
          how_are_you_doing: payload.actions[0].selected_option.value
        })
        await respond("Ok gotten")
      } catch (err) {
        console.log({ err })
      }
    });

  } catch (error) {
    console.log(error);
  }
});

slackEvents.on('message.im', async (event) => {
  console.log(`Received a DM event`);
  console.log({ event, block: event.blocks })

});

const server = createServer(app);

server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`);
});
