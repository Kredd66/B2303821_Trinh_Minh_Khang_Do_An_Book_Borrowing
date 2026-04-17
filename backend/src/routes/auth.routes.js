const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword, getAllUsers, toggleUserStatus } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword, validateMongoId } = require('../middlewares/validate.middleware');

router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);
router.get('/me',        protect,          getMe);
router.put('/profile',   protect, validateUpdateProfile, updateProfile);
router.patch('/change-password', protect, validateChangePassword, changePassword);

// Admin
router.get('/users', protect, isAdmin, getAllUsers);
router.patch('/users/:id/status', protect, isAdmin, validateMongoId, toggleUserStatus);

module.exports = router;