const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    tableNumber: { type: Number, default: null },
    specialInstructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
