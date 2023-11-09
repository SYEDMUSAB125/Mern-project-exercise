const mongoose = require("mongoose");
const prodcutSchema = new mongoose.Schema({
    "name":String,
    "price":Number,
    "category":String,
    "company":String,
    "userId":String

});
const productmodel = mongoose.model("products", prodcutSchema);
module.exports = productmodel; 