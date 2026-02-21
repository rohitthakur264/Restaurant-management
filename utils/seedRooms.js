require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path = require('path');
const Room = require(path.join(__dirname, '..', 'models', 'Room'));

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Room.deleteMany({});

        const rooms = await Room.create([
            { roomNumber: '101', type: 'standard', floor: 1, pricePerNight: 1500, capacity: 2, amenities: ['WiFi', 'AC', 'TV'], description: 'Cozy standard room with city view' },
            { roomNumber: '102', type: 'standard', floor: 1, pricePerNight: 1500, capacity: 2, amenities: ['WiFi', 'AC', 'TV'], description: 'Comfortable standard room with garden view' },
            { roomNumber: '201', type: 'deluxe', floor: 2, pricePerNight: 2500, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service'], description: 'Spacious deluxe room with premium furnishing' },
            { roomNumber: '202', type: 'deluxe', floor: 2, pricePerNight: 2500, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Balcony'], description: 'Deluxe room with private balcony and pool view' },
            { roomNumber: '301', type: 'suite', floor: 3, pricePerNight: 4500, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Bathtub'], description: 'Elegant suite with separate living area' },
            { roomNumber: '302', type: 'suite', floor: 3, pricePerNight: 4500, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Balcony'], description: 'Premium suite with panoramic views' },
            { roomNumber: '401', type: 'premium-suite', floor: 4, pricePerNight: 7000, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Bathtub', 'Jacuzzi', 'Butler Service'], description: 'Luxurious premium suite with jacuzzi' },
            { roomNumber: '501', type: 'penthouse', floor: 5, pricePerNight: 12000, capacity: 6, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Living Area', 'Kitchen', 'Jacuzzi', 'Private Terrace', 'Butler Service'], description: 'Exclusive penthouse with private terrace and 360° city views' }
        ]);

        console.log('✅ ' + rooms.length + ' rooms seeded successfully!');
        console.log('');
        rooms.forEach(r => console.log('  Room ' + r.roomNumber + ' | ' + r.type.padEnd(14) + ' | Rs.' + r.pricePerNight + '/night | ' + r.capacity + ' guests'));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
