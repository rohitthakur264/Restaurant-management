const router = require('express').Router();
const ctrl = require('../controllers/menuController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth, role('admin'), ctrl.create);
router.put('/:id', auth, role('admin'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
