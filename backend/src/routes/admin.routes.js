const router = require('express').Router();
const { getDashboardStats } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/stats', protect, isAdmin, getDashboardStats);

module.exports = router;
