import React from "react";
import { Link, Navigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
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
        <p>Vui lòng đăng nhập để bắt đầu học từ vựng</p>
      </div>

      <Login
        onSwitchToRegister={() => {
          // Sử dụng Link component thay vì callback
        }}
      />
    </div>
  );
};

export default LoginPage;
