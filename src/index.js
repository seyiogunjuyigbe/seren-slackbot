// const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { App, ExpressReceiver } = require('@slack/bolt');

const DB = require('./database');
const { DB_URL, PORT, SIGNING_SECRET, OAUTH_TOKEN } = require('./config/config');


const expressReceiver = new ExpressReceiver({
  signingSecret: SIGNING_SECRET,
  endpoints: '/slack/events'
});
const bot = new App({
  signingSecret: SIGNING_SECRET,
  token: OAUTH_TOKEN,
  receiver: expressReceiver
});
bot.event("app_mention", async ({ context, event }) => {

  try {
    await bot.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: `Hey yoo <@${event.user}> you mentioned me`
    });
  }
  catch (e) {
    console.log(`error responding ${e}`);
  }

});
const app = expressReceiver.app;
const routes = require('./routes');
new DB().connect(DB_URL);

app.use(cors());
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

// log every request to the console
app.use(morgan('dev'));

// app.use(routes);
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Hello World',
  });
});
app.all('*', (req, res) => {
  return res.status(404).json({
    error: true,
    message: 'Requested route not found',
  });
});

// error handling middleware
app.use((err, req, res) => {
  console.error(err.stack || err.message || err);
  res.status(500).json({
    error: true,
    message: err.stack || err.message || err,
  });
});
const port = process.env.port || PORT || 3000;



(async () => {
  await bot.start(port);

  console.log('Slackbot is running!');
})();
;
