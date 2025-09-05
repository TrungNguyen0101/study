import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AddVocabulary from "./AddVocabulary";
import ReviewGame from "./ReviewGame";
import VocabularyList from "./VocabularyList";
import FlashcardGame from "./FlashcardGame";
import MultipleChoiceGame from "./MultipleChoiceGame";
import FillBlankGame from "./FillBlankGame";
import CombinedGame from "./CombinedGame";
import MigrationButton from "./MigrationButton";

const MainApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    // Lấy currentPage từ localStorage, mặc định là "add"
    return localStorage.getItem("currentPage") || "add";
  });

  // Lưu currentPage vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container">
      <nav className="nav">
        <h2 style={{ margin: 0, color: "#333", flexGrow: 1 }}>
          📚 Ứng dụng Luyện Từ Vựng
        </h2>
        <div className="nav-buttons">
          <button
            className={`nav-button ${currentPage === "add" ? "active" : ""}`}
            onClick={() => setCurrentPage("add")}
          >
            ➕ Add
          </button>
          <button
            className={`nav-button ${currentPage === "list" ? "active" : ""}`}
            onClick={() => setCurrentPage("list")}
          >
            📋 List
          </button>
          <button
            className={`nav-button ${
              currentPage === "flashcard" ? "active" : ""
            }`}
            onClick={() => setCurrentPage("flashcard")}
          >
            🎴 Flashcard
          </button>
          <button
            className={`nav-button ${currentPage === "review" ? "active" : ""}`}
            onClick={() => setCurrentPage("review")}
          >
            🎮 Review
          </button>
          <button
            className={`nav-button ${currentPage === "quiz" ? "active" : ""}`}
            onClick={() => setCurrentPage("combined")}
          >
            🧠 Quiz
          </button>
        </div>
        <div className="user-info">
          {/* <MigrationButton /> */}
          <span className="username">👤 {user.username}</span>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </nav>

      {currentPage === "add" && <AddVocabulary />}
      {currentPage === "list" && <VocabularyList />}
      {currentPage === "flashcard" && <FlashcardGame />}
      {currentPage === "review" && <ReviewGame />}
      {currentPage === "quiz" && <MultipleChoiceGame />}
      {currentPage === "fillblank" && <FillBlankGame />}
      {currentPage === "combined" && <CombinedGame />}
    </div>
  );
};

export default MainApp;
