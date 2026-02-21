const MenuItem = require('../models/MenuItem');

exports.getAll = async (req, res) => {
    try {
        const { search, category, available, isVeg } = req.query;
        let filter = {};
        if (category) filter.category = category;
        if (available !== undefined) filter.available = available === 'true';
        if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Menu item not found.' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ error: 'Menu item not found.' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Menu item not found.' });
        res.json({ message: 'Menu item deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
