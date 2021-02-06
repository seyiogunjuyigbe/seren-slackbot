const { ExpressReceiver } = require('@slack/bolt');
const { SIGNING_SECRET } = require('./config');
const expressReceiver = new ExpressReceiver({
    signingSecret: SIGNING_SECRET,
});

module.exports = expressReceiver.app;