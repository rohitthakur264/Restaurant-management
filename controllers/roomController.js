const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');

// ---- Rooms CRUD ----
exports.getAllRooms = async (req, res) => {
    try {
        const { type, available, search } = req.query;
        let filter = {};
        if (type) filter.type = type;
        if (available !== undefined) filter.isAvailable = available === 'true';
        if (search) filter.roomNumber = { $regex: search, $options: 'i' };
        const rooms = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        res.json({ message: 'Room deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ---- Bookings ----
exports.getAllBookings = async (req, res) => {
    try {
        const { status, paymentStatus } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        const bookings = await RoomBooking.find(filter)
            .populate('room')
            .populate('customer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await RoomBooking.find({ customer: req.user._id })
            .populate('room')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ error: 'Room not found.' });
        if (!room.isAvailable) return res.status(400).json({ error: 'Room is not available.' });

        // Check for overlapping bookings
        const overlap = await RoomBooking.findOne({
            room: roomId,
            status: { $in: ['booked', 'checked-in'] },
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });
        if (overlap) return res.status(400).json({ error: 'Room is already booked for those dates.' });

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const totalNights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
        const totalAmount = totalNights * room.pricePerNight;

        const booking = await RoomBooking.create({
            room: roomId,
            customer: req.user._id,
            roomNumber: room.roomNumber,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests || 1,
            totalNights,
            totalAmount,
            specialRequests: specialRequests || ''
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'booked') return res.status(400).json({ error: 'Can only check in a booked reservation.' });
        booking.status = 'checked-in';
        booking.checkedInAt = new Date();
        await booking.save();

        // Mark room as unavailable
        await Room.findByIdAndUpdate(booking.room, { isAvailable: false });

        const populated = await RoomBooking.findById(booking._id).populate('room').populate('customer', 'name email phone');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status !== 'checked-in') return res.status(400).json({ error: 'Guest must be checked in first.' });

        const { paymentMethod } = req.body;
        booking.status = 'checked-out';
        booking.checkedOutAt = new Date();
        booking.paymentStatus = 'paid';
        booking.paymentMethod = paymentMethod || 'cash';
        booking.paidAt = new Date();
        await booking.save();

        // Mark room as available again
        await Room.findByIdAndUpdate(booking.room, { isAvailable: true });

        const populated = await RoomBooking.findById(booking._id).populate('room').populate('customer', 'name email phone');
        res.json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });
        if (booking.status === 'checked-out') return res.status(400).json({ error: 'Cannot cancel a completed booking.' });
        booking.status = 'cancelled';
        if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
        await booking.save();

        // Free the room
        await Room.findByIdAndUpdate(booking.room, { isAvailable: true });

        res.json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
