const router = require("express").Router();
const Bot = require("../controllers/botController");

router.post("/events", Bot.eventCallback)
module.exports = router;