const app = require('express')();
const { createServer } = require('http');
const { createEventAdapter } = require('@slack/events-api');

const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN, BOT_USER_TOKEN } = require('./config/config');
const slackEvents = createEventAdapter(SIGNING_SECRET);

const port = process.env.PORT || PORT || 3000;

app.use('/slack/events', slackEvents.expressMiddleware());
// Create a plain http server, and then attach the event adapter as a request listener


createServer(slackEvents.requestListener());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);


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
