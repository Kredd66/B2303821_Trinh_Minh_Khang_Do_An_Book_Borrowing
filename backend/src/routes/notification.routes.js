const router = require('express').Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  clearRead,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateMongoId } = require('../middlewares/validate.middleware');

router.get('/',                 protect, getMyNotifications);
router.patch('/read-all',       protect, markAllAsRead);
router.patch('/:id/read',       protect, validateMongoId, markAsRead);
router.delete('/clear-read',    protect, clearRead);

module.exports = router;
