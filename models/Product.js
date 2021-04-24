const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    id: Number,
    brand: { type: String, required: true },
    description: String,
    image: String,
    price: { type: Number, required: true },
    discounted: Boolean,
});

module.exports = mongoose.model('Products', ProductSchema);
