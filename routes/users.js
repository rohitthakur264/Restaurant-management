const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), ctrl.getAll);
router.get('/:id', auth, role('admin'), ctrl.getById);
router.put('/:id', auth, role('admin'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
