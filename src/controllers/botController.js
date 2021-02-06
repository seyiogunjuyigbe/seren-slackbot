const { success, error } = require("../middlewares/response")

module.exports = {
    async eventCallback(req, res) {
        try {
            return success(res, 200, null)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}