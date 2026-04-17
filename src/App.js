// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import BookingPage from "./components/BookingPage";

const App = () => {
  const [user, setUser] = useState(null);

  // 检查本地存储的登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem("bookingUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 处理登录和登出
  const handleLogin = (userData) => {
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("bookingUser");
    setUser(null);
  };

  return <div>{user ? <BookingPage user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}</div>;
};

export default App;
