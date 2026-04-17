const router = require('express').Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateMongoId } = require('../middlewares/validate.middleware');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.patch('/:id/cancel', protect, validateMongoId, cancelReservation);

module.exports = router;
