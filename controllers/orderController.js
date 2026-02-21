const Order = require('../models/Order');

exports.getAll = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.status = status;
        const orders = await Order.find(filter)
            .populate('customer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { items, tableNumber, specialInstructions } = req.body;
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const order = await Order.create({
            customer: req.user._id,
            items,
            total,
            tableNumber,
            specialInstructions
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('customer', 'name email phone');
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        res.json({ message: 'Order deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
