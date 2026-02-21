const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['kg', 'litre', 'pieces', 'packets', 'dozen'], default: 'kg' },
    reorderLevel: { type: Number, default: 10 },
    costPerUnit: { type: Number, default: 0 },
    supplier: { type: String, default: '' },
    lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
