import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>📚 Ứng dụng Luyện Từ Vựng</h1>
        <p>Vui lòng đăng nhập hoặc đăng ký để bắt đầu học từ vựng</p>
      </div>

      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;
