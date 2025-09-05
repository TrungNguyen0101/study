const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Tên đăng nhập là bắt buộc"],
    unique: true,
    trim: true,
    minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
    maxlength: [20, "Tên đăng nhập không được quá 20 ký tự"],
  },
  password: {
    type: String,
    required: [true, "Mật khẩu là bắt buộc"],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
