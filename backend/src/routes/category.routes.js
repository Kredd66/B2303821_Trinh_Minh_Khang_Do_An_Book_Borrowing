const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/',      getCategories);
router.post('/',     protect, isAdmin, createCategory);
router.put('/:id',   protect, isAdmin, updateCategory);
router.delete('/:id',protect, isAdmin, deleteCategory);

module.exports = router;