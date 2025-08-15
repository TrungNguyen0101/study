import React, { useState, useEffect } from "react";
import AddVocabulary from "./components/AddVocabulary";
import ReviewGame from "./components/ReviewGame";
import VocabularyList from "./components/VocabularyList";
import FlashcardGame from "./components/FlashcardGame";
import MultipleChoiceGame from "./components/MultipleChoiceGame";
import FillBlankGame from "./components/FillBlankGame";
import CombinedGame from "./components/CombinedGame";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Lấy currentPage từ localStorage, mặc định là "add"
    return localStorage.getItem("currentPage") || "add";
  });

  // Lưu currentPage vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

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
}

export default App;
