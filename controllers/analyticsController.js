const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

exports.getDashboard = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalStaff = await User.countDocuments({ role: 'staff' });
        const totalMenuItems = await MenuItem.countDocuments();

        // Revenue
        const payments = await Payment.find({ status: 'paid' });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Recent orders
        const recentOrders = await Order.find()
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Revenue by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyRevenue = await Payment.aggregate([
            { $match: { status: 'paid', paidAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$amount' } } },
            { $sort: { _id: 1 } }
        ]);

        // Popular items
        const popularItems = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalOrdered: { $sum: '$items.quantity' } } },
            { $sort: { totalOrdered: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalOrders, pendingOrders, totalCustomers, totalStaff,
            totalMenuItems, totalRevenue, recentOrders,
            ordersByStatus, dailyRevenue, popularItems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
