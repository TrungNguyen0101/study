import React from "react";
import { Link, Navigate } from "react-router-dom";
import Register from "./Register";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳ Đang tải...</div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect về trang chính
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>📚 Ứng dụng Luyện Từ Vựng</h1>
        <p>Tạo tài khoản để bắt đầu học từ vựng</p>
      </div>

      <Register
        onSwitchToLogin={() => {
          // Sử dụng Link component thay vì callback
        }}
      />

      <div className="auth-switch-external">
        <p>
          Đã có tài khoản?{" "}
          <Link to="/login" className="link-button">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
