const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomNumber: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1, min: 1 },
    totalNights: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['booked', 'checked-in', 'checked-out', 'cancelled'],
        default: 'booked'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online', ''],
        default: ''
    },
    specialRequests: { type: String, default: '' },
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
    paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('RoomBooking', roomBookingSchema);
