import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: false },

});

NoteSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);
export default Note;
