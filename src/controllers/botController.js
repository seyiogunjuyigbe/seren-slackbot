const sendApiResponse = require("../middlewares/response")
const { find, findOne } = require("../utils/query");
const Response = require("../models/response")
module.exports = {
    async fetchResponses(req, res) {
        try {
            let userResponses = await find(Response, req);
            return sendApiResponse(
                res,
                200,
                "user responses fetched successfully",
                userResponses
            )
        } catch (err) {
            return sendApiResponse(res, 500, err.message)
        }
    },
    async fetchSingleResponse(req, res) {
        try {
            let userResponse = await findOne(Response, req);
            return sendApiResponse(
                res,
                200,
                "user response fetched successfully",
                userResponse
            )
        } catch (err) {
            return sendApiResponse(res, 500, err.message)
        }
    }
}