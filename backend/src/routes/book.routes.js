const router = require('express').Router();
const {
  getBooks, getBookById, createBook,
  updateBook, updateStock, deleteBook, restoreBook
} = require('../controllers/book.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const {
  validateCreateBook,
  validateUpdateBook,
  validateUpdateStock,
  validateMongoId,
} = require('../middlewares/validate.middleware');

router.get('/',            getBooks);
router.get('/:id',         validateMongoId, getBookById);
router.post('/',           protect, isAdmin, validateCreateBook, createBook);
router.put('/:id',         protect, isAdmin, validateMongoId, validateUpdateBook, updateBook);
router.patch('/:id/stock', protect, isAdmin, validateMongoId, validateUpdateStock, updateStock);
router.patch('/:id/restore', protect, isAdmin, validateMongoId, restoreBook);
router.delete('/:id',      protect, isAdmin, validateMongoId, deleteBook);

module.exports = router;