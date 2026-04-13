const router = require('express').Router();
const {
  getBooks, getBookById, createBook,
  updateBook, updateStock, deleteBook
} = require('../controllers/book.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/',            getBooks);
router.get('/:id',         getBookById);
router.post('/',           protect, isAdmin, createBook);
router.put('/:id',         protect, isAdmin, updateBook);
router.patch('/:id/stock', protect, isAdmin, updateStock);
router.delete('/:id',      protect, isAdmin, deleteBook);

module.exports = router;