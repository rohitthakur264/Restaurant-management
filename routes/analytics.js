const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), ctrl.getDashboard);

module.exports = router;
