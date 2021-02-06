const router = require("express").Router();
const slackRoutes = require("./slackRoutes");

router.use("/slack", slackRoutes)
module.exports = router;