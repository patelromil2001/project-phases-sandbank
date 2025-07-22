import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, sparse: true }, // Optional, unique
  email: { type: String, unique: true },
  password: String,
  profileSlug: { type: String, unique: true, sparse: true }, // Optional, unique
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
