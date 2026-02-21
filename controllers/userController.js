const User = require('../models/User');

exports.getAll = async (req, res) => {
    try {
        const { role, search } = req.query;
        let filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { name, phone, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, role, isActive },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
