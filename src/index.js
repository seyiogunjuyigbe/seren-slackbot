
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const port = process.env.PORT || PORT || 3000;
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

app.listen(port, () => {
  console.log(`Listening for events on ${port}`);
});


const { WebClient } = require('@slack/web-api');
// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(BOT_USER_TOKEN);
// The current date
const currentTime = new Date().toTimeString();

(async () => {

  try {
    // Use the `chat.postMessage` method to send a message from this app
    await web.chat.postMessage({
      channel: '#general',
      text: `The current time is ${currentTime}`,
    });
  } catch (error) {
    console.log(error);
  }

  console.log('Message posted!');
})();
