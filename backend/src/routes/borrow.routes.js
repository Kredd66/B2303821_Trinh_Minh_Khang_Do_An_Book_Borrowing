const router = require('express').Router();
const {
  createBorrowRequest,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  returnBorrow,
  reportLostBook,
  cancelBorrow,
  requestRenewal,
  approveRenewal,
} = require('../controllers/borrow.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const {
  validateCreateBorrow,
  validateMongoId,
} = require('../middlewares/validate.middleware');

router.post('/',               protect,          validateCreateBorrow, createBorrowRequest);
router.get('/my',              protect,          getMyBorrows);
router.get('/',                protect, isAdmin, getAllBorrows);
router.delete('/:id',          protect,          validateMongoId, cancelBorrow);
router.patch('/:id/request-renewal', protect, validateMongoId, requestRenewal);

router.patch('/:id/approve',   protect, isAdmin, validateMongoId, approveBorrow);
router.patch('/:id/approve-renewal', protect, isAdmin, validateMongoId, approveRenewal);
router.patch('/:id/return',    protect, isAdmin, validateMongoId, returnBorrow);
router.patch('/:id/lost',      protect, isAdmin, validateMongoId, reportLostBook);

module.exports = router;