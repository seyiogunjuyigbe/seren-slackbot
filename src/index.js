
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const port = process.env.PORT || PORT || 3000;

const web = new WebClient(BOT_USER_TOKEN);
const slackEvents = createEventAdapter(SIGNING_SECRET);

// Create an express application
const app = express();

// Plug the adapter in as a middleware
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
      text: `Hey ${event.user} you buzzed me`,
    });
  } catch (error) {
    console.log(error);
  }
  console.log({ event })
});
(async () => {
  const server = await slackEvents.start(app.listen(port));
  console.log(`Listening for events on ${server.address().port}`);
})();
