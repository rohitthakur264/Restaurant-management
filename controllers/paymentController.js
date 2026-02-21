const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { generatePDF } = require('../utils/pdfGenerator');

exports.getAll = async (req, res) => {
    try {
        const { status, method } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (method) filter.method = method;
        const payments = await Payment.find(filter)
            .populate({ path: 'order', populate: { path: 'customer', select: 'name email phone' } })
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { orderId, method, transactionId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        const payment = await Payment.create({
            order: orderId,
            amount: order.total,
            method: method || 'cash',
            status: 'paid',
            transactionId: transactionId || '',
            paidAt: new Date()
        });
        order.status = 'delivered';
        await order.save();
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPDF = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({ path: 'order', populate: [{ path: 'customer', select: 'name email phone' }] });
        if (!payment) return res.status(404).json({ error: 'Payment not found.' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill-${payment._id}.pdf`);
        generatePDF(payment, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
