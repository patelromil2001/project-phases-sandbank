// models/Book.ts
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  googleId: { type: String, required: true },
  title: String,
  authors: [String],
  thumbnail: String,
  categories: [String],            // ← Added
  status: { type: String, enum: ['wishlist','reading','finished','abandoned'], default: 'wishlist' },
  startDate: Date,
  endDate: Date,
  rating: Number,
  tags: [String],
  notes: String,
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export default Book;
