const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { validateCategory, validateMongoId } = require('../middlewares/validate.middleware');

router.get('/',       getCategories);
router.post('/',      protect, isAdmin, validateCategory,          createCategory);
router.put('/:id',    protect, isAdmin, validateMongoId, validateCategory, updateCategory);
router.delete('/:id', protect, isAdmin, validateMongoId,            deleteCategory);

module.exports = router;