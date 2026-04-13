const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    author:      { type: String, required: true, trim: true },
    isbn:        { type: String, trim: true, default: '' },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    coverImage:  { type: String, default: '' },        // Cloudinary URL
    description: { type: String, default: '' },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    totalCopies: { type: Number, required: true, min: 0, default: 0 },
    isActive:    { type: Boolean, default: true },     // soft delete
  },
  { timestamps: true }
);

// Index để tối ưu tìm kiếm text
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);