const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền thực hiện thao tác này' });
};

const isReader = (req, res, next) => {
  if (req.user && req.user.role === 'reader') return next();
  return res.status(403).json({ success: false, message: 'Chỉ dành cho Reader' });
};

module.exports = { isAdmin, isReader };