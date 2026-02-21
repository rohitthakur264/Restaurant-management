require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await MenuItem.deleteMany({});
        await Inventory.deleteMany({});

        // Users
        const users = await User.create([
            { name: 'Admin User', email: 'admin@restaurant.com', password: 'admin123', role: 'admin', phone: '9876543210' },
            { name: 'Staff One', email: 'staff@restaurant.com', password: 'staff123', role: 'staff', phone: '9876543211' },
            { name: 'John Customer', email: 'john@example.com', password: 'customer123', role: 'customer', phone: '9876543212' },
            { name: 'Jane Customer', email: 'jane@example.com', password: 'customer123', role: 'customer', phone: '9876543213' }
        ]);
        console.log(`✅ ${users.length} users seeded`);

        // Menu Items
        const menuItems = await MenuItem.create([
            { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection with spices', price: 280, category: 'appetizer', available: true, isVeg: true, preparationTime: 20 },
            { name: 'Chicken Wings', description: 'Crispy fried wings tossed in spicy buffalo sauce', price: 320, category: 'appetizer', available: true, isVeg: false, preparationTime: 15 },
            { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with fresh vegetables', price: 180, category: 'appetizer', available: true, isVeg: true, preparationTime: 10 },
            { name: 'Butter Chicken', description: 'Tender chicken in creamy tomato-butter gravy', price: 380, category: 'main-course', available: true, isVeg: false, preparationTime: 25 },
            { name: 'Dal Makhani', description: 'Black lentils slow-cooked in rich buttery gravy', price: 260, category: 'main-course', available: true, isVeg: true, preparationTime: 30 },
            { name: 'Biryani', description: 'Aromatic basmati rice layered with spiced meat and herbs', price: 350, category: 'main-course', available: true, isVeg: false, preparationTime: 35 },
            { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella, tomato sauce and fresh basil', price: 299, category: 'main-course', available: true, isVeg: true, preparationTime: 20 },
            { name: 'Grilled Salmon', description: 'Fresh salmon fillet grilled with herbs and lemon butter', price: 520, category: 'main-course', available: true, isVeg: false, preparationTime: 25 },
            { name: 'Pasta Alfredo', description: 'Creamy parmesan pasta with garlic and herbs', price: 320, category: 'main-course', available: true, isVeg: true, preparationTime: 15 },
            { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings soaked in sugar syrup', price: 120, category: 'dessert', available: true, isVeg: true, preparationTime: 5 },
            { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center', price: 220, category: 'dessert', available: true, isVeg: true, preparationTime: 15 },
            { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate sauce and sprinkles', price: 150, category: 'dessert', available: true, isVeg: true, preparationTime: 5 },
            { name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 60, category: 'beverage', available: true, isVeg: true, preparationTime: 5 },
            { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda and mint', price: 80, category: 'beverage', available: true, isVeg: true, preparationTime: 3 },
            { name: 'Cold Coffee', description: 'Chilled coffee blended with ice cream', price: 140, category: 'beverage', available: true, isVeg: true, preparationTime: 5 },
            { name: 'Mango Smoothie', description: 'Fresh Alphonso mango blended smooth', price: 160, category: 'beverage', available: true, isVeg: true, preparationTime: 5 }
        ]);
        console.log(`✅ ${menuItems.length} menu items seeded`);

        // Inventory
        const inventory = await Inventory.create([
            { itemName: 'Rice (Basmati)', quantity: 50, unit: 'kg', reorderLevel: 10, costPerUnit: 120, supplier: 'GrainMart' },
            { itemName: 'Chicken', quantity: 30, unit: 'kg', reorderLevel: 5, costPerUnit: 220, supplier: 'FreshMeats Co.' },
            { itemName: 'Paneer', quantity: 15, unit: 'kg', reorderLevel: 5, costPerUnit: 300, supplier: 'Dairy Fresh' },
            { itemName: 'Tomato', quantity: 25, unit: 'kg', reorderLevel: 8, costPerUnit: 40, supplier: 'VegWorld' },
            { itemName: 'Onion', quantity: 40, unit: 'kg', reorderLevel: 10, costPerUnit: 35, supplier: 'VegWorld' },
            { itemName: 'Cooking Oil', quantity: 20, unit: 'litre', reorderLevel: 5, costPerUnit: 150, supplier: 'OilMasters' },
            { itemName: 'Milk', quantity: 30, unit: 'litre', reorderLevel: 10, costPerUnit: 55, supplier: 'Dairy Fresh' },
            { itemName: 'Flour (Maida)', quantity: 25, unit: 'kg', reorderLevel: 8, costPerUnit: 45, supplier: 'GrainMart' },
            { itemName: 'Sugar', quantity: 15, unit: 'kg', reorderLevel: 5, costPerUnit: 50, supplier: 'GrainMart' },
            { itemName: 'Butter', quantity: 10, unit: 'kg', reorderLevel: 3, costPerUnit: 450, supplier: 'Dairy Fresh' },
            { itemName: 'Eggs', quantity: 5, unit: 'dozen', reorderLevel: 3, costPerUnit: 80, supplier: 'FreshMeats Co.' },
            { itemName: 'Napkins', quantity: 8, unit: 'packets', reorderLevel: 10, costPerUnit: 25, supplier: 'SupplyKing' }
        ]);
        console.log(`✅ ${inventory.length} inventory items seeded`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login credentials:');
        console.log('   Admin:    admin@restaurant.com / admin123');
        console.log('   Staff:    staff@restaurant.com / staff123');
        console.log('   Customer: john@example.com / customer123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
