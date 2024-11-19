const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // avatar: Buffer,
  // imageUrl: String,
  hskLevel: String,
  status: { type: String, default: "active" },
  // savedWords: { type: [String], ref: "Word" },
  role: { type: String, default: "normalUser" },
});

const User = mongoose.model("Users", UserSchema);

module.exports = { User };
