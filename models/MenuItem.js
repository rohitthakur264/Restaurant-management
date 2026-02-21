const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'snack', 'special'],
        default: 'main-course'
    },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: false },
    preparationTime: { type: Number, default: 15 } // minutes
}, { timestamps: true });

menuItemSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
