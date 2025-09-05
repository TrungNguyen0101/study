const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
      });
    }

    // Kiểm tra tên đăng nhập đã tồn tại
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại",
      });
    }

    // Tạo user mới
    const user = new User({ username, password });
    await user.save();

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, "day-la-mat-khau-bi-mat", {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký",
    });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu",
      });
    }

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Cập nhật last login
    user.lastLogin = new Date();
    await user.save();

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, "day-la-mat-khau-bi-mat", {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập",
    });
  }
});

// Lấy thông tin user hiện tại
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin user",
    });
  }
});

module.exports = router;
