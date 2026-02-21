const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'card', 'upi', 'online'], default: 'cash' },
    status: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'pending' },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
