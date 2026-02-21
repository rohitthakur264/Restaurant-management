const PDFDocument = require('pdfkit');

const generatePDF = (payment, stream) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('FLAVOUR HAVEN', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Premium Restaurant & Fine Dining', { align: 'center' });
    doc.text('123 Gourmet Street, Food City - 400001', { align: 'center' });
    doc.text('Phone: +91 98765 43210 | GST: 27AABCU9603R1ZM', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Bill details
    doc.fontSize(14).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Bill No: ${payment._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Date: ${new Date(payment.paidAt || payment.createdAt).toLocaleDateString('en-IN')}`);
    doc.text(`Payment Method: ${payment.method.toUpperCase()}`);
    if (payment.transactionId) doc.text(`Transaction ID: ${payment.transactionId}`);
    doc.moveDown();

    // Customer
    if (payment.order && payment.order.customer) {
        doc.font('Helvetica-Bold').text('Customer Details:');
        doc.font('Helvetica');
        doc.text(`Name: ${payment.order.customer.name}`);
        doc.text(`Email: ${payment.order.customer.email}`);
        if (payment.order.customer.phone) doc.text(`Phone: ${payment.order.customer.phone}`);
        doc.moveDown();
    }

    // Items table header
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Item', 50, tableTop, { width: 200 });
    doc.text('Qty', 260, tableTop, { width: 60, align: 'center' });
    doc.text('Price', 330, tableTop, { width: 80, align: 'right' });
    doc.text('Total', 420, tableTop, { width: 120, align: 'right' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    doc.font('Helvetica').fontSize(10);
    if (payment.order && payment.order.items) {
        payment.order.items.forEach(item => {
            const y = doc.y;
            doc.text(item.name, 50, y, { width: 200 });
            doc.text(item.quantity.toString(), 260, y, { width: 60, align: 'center' });
            doc.text(`₹${item.price.toFixed(2)}`, 330, y, { width: 80, align: 'right' });
            doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 420, y, { width: 120, align: 'right' });
            doc.moveDown();
        });
    }

    // Total
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    const subtotal = payment.amount;
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;
    doc.font('Helvetica').text('Subtotal:', 330, doc.y, { width: 80, align: 'right' });
    doc.text(`₹${subtotal.toFixed(2)}`, 420, doc.y - doc.currentLineHeight(), { width: 120, align: 'right' });
    doc.moveDown(0.3);
    doc.text('GST (5%):', 330, doc.y, { width: 80, align: 'right' });
    doc.text(`₹${tax.toFixed(2)}`, 420, doc.y - doc.currentLineHeight(), { width: 120, align: 'right' });
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Grand Total:', 300, doc.y, { width: 110, align: 'right' });
    doc.text(`₹${grandTotal.toFixed(2)}`, 420, doc.y - doc.currentLineHeight(), { width: 120, align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').text('Thank you for dining with us!', { align: 'center' });
    doc.text('Visit again soon — Flavour Haven', { align: 'center' });

    doc.end();
};

module.exports = { generatePDF };
