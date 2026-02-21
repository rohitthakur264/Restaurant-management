const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), ctrl.getAll);
router.post('/', auth, role('admin', 'staff'), ctrl.create);
router.get('/:id/pdf', auth, ctrl.getPDF);

module.exports = router;
