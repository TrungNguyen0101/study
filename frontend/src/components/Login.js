import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(""); // Xóa lỗi khi người dùng bắt đầu nhập
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(formData.username, formData.password);

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
        <h2>🔐 Đăng nhập</h2>

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
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "⏳ Đang đăng nhập..." : "🚀 Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
