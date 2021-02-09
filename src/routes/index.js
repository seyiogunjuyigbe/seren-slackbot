const router = require("express").Router();
const Bot = require("../controllers/botController");

router.get("/responses", Bot.fetchResponses);
router.get("/responses/:responseId", Bot.fetchSingleResponse);

module.exports = router;