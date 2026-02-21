const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['standard', 'deluxe', 'suite', 'premium-suite', 'penthouse'],
        default: 'standard'
    },
    floor: { type: Number, default: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 2 },
    amenities: [{ type: String }],
    description: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
