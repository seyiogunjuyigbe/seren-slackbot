
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require("@slack/interactive-messages")
const { WebClient } = require('@slack/web-api');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const port = process.env.PORT || PORT || 3000;
const port2 = process.env.PORT || 4000;

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
  console.log("req.body", req);
  slackInteractions.action({ type: 'static_select' }, (payload, respond) => {
    // Logs the contents of the action to the console
    console.log('payload', payload);

    // Send an additional message to the whole channel
    // doWork()
    //   .then(() => {
    //     respond({ text: 'Thanks for your submission.' });
    //   })
    //   .catch((error) => {
    //     respond({ text: 'Sorry, there\'s been an error. Try again later.' });
    //   });

    // If you'd like to replace the original message, use `chat.update`.
    // Not returning any value.
  });
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
      // Logs the contents of the action to the console
      console.log('payload', payload);

      // Send an additional message to the whole channel
      // doWork()
      //   .then(() => {
      //     respond({ text: 'Thanks for your submission.' });
      //   })
      //   .catch((error) => {
      //     respond({ text: 'Sorry, there\'s been an error. Try again later.' });
      //   });

      // If you'd like to replace the original message, use `chat.update`.
      // Not returning any value.
    });

  } catch (error) {
    console.log(error);
  }
});

slackEvents.on('message.im', async (event) => {
  console.log(`Received a DM event`);
  console.log({ event, block: event.blocks })

});
(async () => {
  const server = await slackEvents.start(app.listen(port));
  const server2 = await slackInteractions.start(port2);

  console.log(`Listening for events on ${server.address().port}`);
  console.log(`Listening for events on ${server2.address().port2}`);

})();
