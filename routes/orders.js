const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'staff'), ctrl.getAll);
router.get('/my', auth, ctrl.getMyOrders);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, role('customer'), ctrl.create);
router.patch('/:id/status', auth, role('admin', 'staff'), ctrl.updateStatus);
router.delete('/:id', auth, role('admin'), ctrl.deleteOrder);

module.exports = router;
