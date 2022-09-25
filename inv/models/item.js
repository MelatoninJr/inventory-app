const mongoose = require('mongoose')
const Schema = mongoose.Schema


const ItemSchema = new Schema({
    name: { type: String, required: true, minLength: 3},
    description: { type: String, required: true, minLength: 3},
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true},
    stock: { type: Number, required: true},
    link: { type: String, required: true}

})


ItemSchema.virtual("url").get(function () {
    return `/shop/items/` + this._id;
})

module.exports = mongoose.model("Item", ItemSchema)