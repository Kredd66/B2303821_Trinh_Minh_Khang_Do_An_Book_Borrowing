const router = require('express').Router();
const { createBorrowRequest, getMyBorrows, getAllBorrows, approveBorrow, returnBorrow } = require('../controllers/borrow.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.post('/',              protect, createBorrowRequest);   // Reader
router.get('/my',             protect, getMyBorrows);          // Reader
router.get('/',               protect, isAdmin, getAllBorrows); // Admin
router.patch('/:id/approve',  protect, isAdmin, approveBorrow);// Admin
router.patch('/:id/return',   protect, isAdmin, returnBorrow); // Admin

module.exports = router;