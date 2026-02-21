const Inventory = require('../models/Inventory');

exports.getAll = async (req, res) => {
    try {
        const { search, lowStock } = req.query;
        let filter = {};
        if (search) {
            filter.itemName = { $regex: search, $options: 'i' };
        }
        let items = await Inventory.find(filter).sort({ itemName: 1 });
        if (lowStock === 'true') {
            items = items.filter(item => item.quantity <= item.reorderLevel);
        }
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (req.body.quantity !== undefined) {
            req.body.lastRestocked = new Date();
        }
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
        res.json({ message: 'Inventory item deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
