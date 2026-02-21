require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const MenuItem = require(path.join(__dirname, '..', 'models', 'MenuItem'));
const Inventory = require(path.join(__dirname, '..', 'models', 'Inventory'));
const Order = require(path.join(__dirname, '..', 'models', 'Order'));
const Payment = require(path.join(__dirname, '..', 'models', 'Payment'));


(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('\n========================================');
        console.log('  RESTAURANT MANAGEMENT SYSTEM - DB INFO');
        console.log('========================================\n');

        // Users
        const users = await User.find();
        console.log('USERS (' + users.length + '):');
        console.log('------------------------------------------------------------');
        users.forEach(u => {
            console.log('  ' + u.role.toUpperCase().padEnd(10) + ' | ' + u.email.padEnd(28) + ' | ' + u.name);
        });

        // Menu Items
        const items = await MenuItem.find().sort({ category: 1 });
        console.log('\nMENU ITEMS (' + items.length + '):');
        console.log('------------------------------------------------------------');
        items.forEach(i => {
            const veg = i.isVeg ? ' [VEG]' : ' [NON-VEG]';
            console.log('  ' + i.category.padEnd(14) + ' | Rs.' + String(i.price).padEnd(6) + ' | ' + i.name + veg);
        });

        // Inventory
        const inv = await Inventory.find();
        console.log('\nINVENTORY (' + inv.length + '):');
        console.log('------------------------------------------------------------');
        inv.forEach(i => {
            const status = i.quantity <= i.reorderLevel ? 'LOW STOCK!' : 'OK';
            console.log('  ' + i.itemName.padEnd(20) + ' | ' + String(i.quantity).padEnd(5) + i.unit.padEnd(8) + ' | ' + status);
        });

        // Orders & Payments
        const orderCount = await Order.countDocuments();
        const paymentCount = await Payment.countDocuments();
        console.log('\nORDERS: ' + orderCount + ' | PAYMENTS: ' + paymentCount);

        console.log('\n========================================');
        console.log('  LOGIN CREDENTIALS:');
        console.log('  Admin:    admin@restaurant.com / admin123');
        console.log('  Staff:    staff@restaurant.com / staff123');
        console.log('  Customer: john@example.com / customer123');
        console.log('');
        console.log('  Server: http://localhost:5000');
        console.log('========================================\n');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
