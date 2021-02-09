const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema({
    username: String,
    how_are_you_doing: String,
    when_are_you_free_for_a_walk: {
        day: String,
        times: []
    },
    favorite_hobbies: [String],
    number_scale_digits: String,
    timestamp: String
});
module.exports = mongoose.model("Response", responseSchema)