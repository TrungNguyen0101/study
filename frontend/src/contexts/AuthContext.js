import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Kiểm tra token khi khởi tạo
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          // Gửi token và lấy thông tin user
          const response = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (response.data.success) {
            setUser(response.data.user);
            setToken(savedToken);
          } else {
            // Token không hợp lệ
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.",
      };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
