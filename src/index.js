
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require("@slack/interactive-messages")
const { WebClient } = require('@slack/web-api');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const port = process.env.PORT || PORT || 3000;

const web = new WebClient(BOT_USER_TOKEN);
const slackEvents = createEventAdapter(SIGNING_SECRET);
const slackInteractions = createMessageAdapter(SIGNING_SECRET);
const app = express();

app.use('/slack/events', slackEvents.requestListener());
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
app.post("/slack/events", (req, res) => {
  console.log(req.body);

})
// slackEvents.on('message', (event) => {
//   console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
//   console.log({ event })
// });
slackEvents.on('app_mention', async (event) => {
  console.log(`Received a mention event`);
  try {
    // Use the `chat.postMessage` method to send a message from this app

    await web.chat.postMessage({
      channel: event.channel,
      text: `Hey <@${event.user}> you buzzed me`,
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "New request",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Type:*\nPaid Time Off"
            },
            {
              "type": "mrkdwn",
              "text": "*Created by:*\n<example.com|Fred Enriquez>"
            }
          ]
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*When:*\nAug 10 - Aug 13"
            }
          ]
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Approve"
              },
              "style": "primary",
              "value": "click_me_123"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Reject"
              },
              "style": "danger",
              "value": "click_me_123"
            }
          ]
        }
      ]
    });
    let dialog = await web.dialog.open({
      "callback_id": "ryde-46e2b0",
      "title": "Request a Ride",
      "submit_label": "Request",
      "state": "Limo",
      "elements": [
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_origin"
        },
        {
          "type": "text",
          "label": "Dropoff Location",
          "name": "loc_destination"
        }
      ]
    })
    console.log({ dialog })
  } catch (error) {
    console.log(error);
  }
  console.log({ event, block: event.blocks })

});

slackEvents.on('message.app_home', async (event) => {
  console.log(`Received a mention event`);
  console.log({ event, block: event.blocks })

  try {
    // Use the `chat.postMessage` method to send a message from this app
    await web.chat.postMessage({
      channel: event.channel,
      text: `Hey <@${event.user}> you buzzed me`,
    });
  } catch (error) {
    console.log(error);
  }
});
(async () => {
  const server = await slackEvents.start(app.listen(port));
  // await slackInteractions.start();

  console.log(`Listening for events on ${server.address().port}`);
})();
