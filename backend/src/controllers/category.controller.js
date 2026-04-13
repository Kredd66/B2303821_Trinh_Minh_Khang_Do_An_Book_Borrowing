const Category = require('../models/Category.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    return successResponse(res, 200, 'Danh sách thể loại', categories);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const category = await Category.create({ name, slug, description });
    return successResponse(res, 201, 'Tạo thể loại thành công', category);
  } catch (error) {
    if (error.code === 11000) return errorResponse(res, 409, 'Tên thể loại đã tồn tại');
    return errorResponse(res, 500, error.message);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const category = await Category.findByIdAndUpdate(
      req.params.id, { name, slug, description }, { new: true, runValidators: true }
    );
    if (!category) return errorResponse(res, 404, 'Không tìm thấy thể loại');
    return successResponse(res, 200, 'Cập nhật thể loại thành công', category);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return errorResponse(res, 404, 'Không tìm thấy thể loại');
    return successResponse(res, 200, 'Xóa thể loại thành công');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };