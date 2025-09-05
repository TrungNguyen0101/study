import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(""); // Xóa lỗi khi người dùng bắt đầu nhập
  };

  const validateForm = () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin";
    }

    if (formData.username.length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (formData.username.length > 20) {
      return "Tên đăng nhập không được quá 20 ký tự";
    }

    if (formData.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const result = await register(formData.username, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>📝 Đăng ký</h2>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập (3-20 ký tự)"
              disabled={loading}
              autoComplete="username"
            />
            <small className="form-hint">Tên đăng nhập từ 3-20 ký tự</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              disabled={loading}
              autoComplete="new-password"
            />
            <small className="form-hint">Mật khẩu ít nhất 6 ký tự</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "⏳ Đang đăng ký..." : "✨ Đăng ký"}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
