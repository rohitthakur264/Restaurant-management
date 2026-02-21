const router = require('express').Router();
const ctrl = require('../controllers/roomController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Rooms CRUD
router.get('/', ctrl.getAllRooms);  // Public — browse rooms
router.get('/:id', ctrl.getRoomById);
router.post('/', auth, role('admin'), ctrl.createRoom);
router.put('/:id', auth, role('admin'), ctrl.updateRoom);
router.delete('/:id', auth, role('admin'), ctrl.deleteRoom);

// Bookings
router.get('/bookings/all', auth, role('admin', 'staff'), ctrl.getAllBookings);
router.get('/bookings/my', auth, ctrl.getMyBookings);
router.post('/bookings', auth, role('customer'), ctrl.createBooking);
router.patch('/bookings/:id/checkin', auth, role('admin', 'staff'), ctrl.checkIn);
router.patch('/bookings/:id/checkout', auth, role('admin', 'staff'), ctrl.checkOut);
router.patch('/bookings/:id/cancel', auth, ctrl.cancelBooking);

module.exports = router;
