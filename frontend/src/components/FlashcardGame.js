import React, { useState, useEffect, useCallback } from "react";
import vocabularyAPI from "../services/api";

const FlashcardGame = () => {
  const [vocabularies, setVocabularies] = useState([]);
  console.log("🚀 ~ FlashcardGame ~ vocabularies:", vocabularies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);
  const [memorizedCount, setMemorizedCount] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  });

  // Load từ vựng chưa được nhớ
  const loadVocabularies = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await vocabularyAPI.getReviewVocabularies({
        limit: 999, // Load 20 từ mỗi lần
        page: page,
      });

      if (response.data.vocabularies) {
        setVocabularies(response.data.vocabularies);
        setPagination(response.data.pagination);
      } else {
        // Fallback cho API response cũ
        setVocabularies(response.data);
      }

      setCurrentIndex(0);
      setShowAnswer(false);
      setStudiedCount(0);
      setMemorizedCount(0);
    } catch (error) {
      console.error("Error loading vocabularies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load next set
  const loadNextSet = () => {
    if (pagination.hasNext) {
      loadVocabularies(pagination.current + 1);
    } else {
      loadVocabularies(1); // Quay về trang 1
    }
  };

  // Phát âm từ
  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Đánh dấu từ đã nhớ
  const markAsMemorized = async () => {
    if (vocabularies.length === 0) return;

    const currentVocab = vocabularies[currentIndex];
    try {
      await vocabularyAPI.updateMemorized(currentVocab._id, true);
      setMemorizedCount((prev) => prev + 1);

      // Remove từ khỏi danh sách hiện tại
      const newVocabularies = vocabularies.filter(
        (_, index) => index !== currentIndex
      );
      setVocabularies(newVocabularies);

      // Điều chỉnh currentIndex
      if (newVocabularies.length === 0) {
        loadNextSet();
      } else if (currentIndex >= newVocabularies.length) {
        setCurrentIndex(0);
      }

      setShowAnswer(false);
    } catch (error) {
      alert("Có lỗi xảy ra khi đánh dấu từ đã nhớ");
    }
  };

  // Đánh dấu từ đã học (không ưu tiên hiển thị nữa)
  const markAsStudied = async () => {
    if (vocabularies.length === 0) return;

    const currentVocab = vocabularies[currentIndex];
    try {
      await vocabularyAPI.updateStudied(currentVocab._id, true);

      // Cập nhật từ trong danh sách hiện tại
      const updatedVocabularies = vocabularies.map((vocab, index) =>
        index === currentIndex ? { ...vocab, studied: true } : vocab
      );
      setVocabularies(updatedVocabularies);

      // Chuyển đến từ tiếp theo
      nextCard();
    } catch (error) {
      alert("Có lỗi xảy ra khi đánh dấu từ đã học");
    }
  };

  // Next card
  const nextCard = () => {
    setStudiedCount((prev) => prev + 1);

    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setShowAnswer(false);
  };

  // Previous card
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(vocabularies.length - 1);
    }
    setShowAnswer(false);
  };

  // Toggle answer
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  // Initial load
  useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading">Đang tải flashcards...</div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="page">
        <h1>Flashcard</h1>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>🎉 Xuất sắc! Bạn đã nhớ tất cả từ vựng!</h3>
          <p>
            Không còn từ nào cần ôn tập. Hãy thêm từ vựng mới để tiếp tục học.
          </p>
          <button
            onClick={() => loadVocabularies(1)}
            className="btn btn-primary"
            style={{ marginTop: "20px" }}
          >
            🔄 Kiểm tra lại
          </button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];

  return (
    <div className="page">
      {/* Statistics */}
      <div className="stats">
        <div className="stat-item">
          <h3>
            {currentIndex + 1}/{vocabularies.length}
          </h3>
          <p>Thứ tự</p>
        </div>
        <div className="stat-item">
          <h3>{studiedCount}</h3>
          <p>Đã xem</p>
        </div>
        <div className="stat-item">
          <h3>{memorizedCount}</h3>
          <p>Đã nhớ</p>
        </div>
        {pagination.totalItems > 0 && (
          <div className="stat-item">
            <h3>{pagination.totalItems}</h3>
            <p>Tổng cần học</p>
          </div>
        )}
      </div>

      {/* Flashcard */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <div
          className="flashcard"
          onClick={toggleAnswer}
          style={{
            width: "400px",
            height: "250px",
            backgroundColor: "white",
            border: "2px solid #007bff",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            padding: "20px",
            textAlign: "center",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          {!showAnswer ? (
            // Hiển thị từ tiếng Anh
            <div>
              {/* Status indicators */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  gap: "5px",
                }}
              >
                {currentVocab.studied && (
                  <span
                    style={{
                      fontSize: "14px",
                      background: "#17a2b8",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                    title="Đã học"
                  >
                    📖
                  </span>
                )}
                {currentVocab.memorized && (
                  <span
                    style={{
                      fontSize: "14px",
                      background: "#28a745",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                    title="Đã nhớ"
                  >
                    ✅
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#007bff",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {currentVocab.english}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentVocab.english);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title="Phát âm"
                >
                  🔊
                </button>
              </div>

              {currentVocab.pronunciation && (
                <div
                  style={{
                    fontSize: "18px",
                    color: "#666",
                    fontStyle: "italic",
                    marginBottom: "15px",
                  }}
                >
                  {currentVocab.pronunciation}
                </div>
              )}

              {currentVocab.wordType && (
                <div
                  style={{
                    fontSize: "18px",
                    color: "#666",
                    fontStyle: "italic",
                    marginBottom: "15px",
                  }}
                >
                  {currentVocab.wordType}
                </div>
              )}

              <div
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginTop: "auto",
                }}
              >
                💡 Click để xem nghĩa
              </div>
            </div>
          ) : (
            // Hiển thị nghĩa tiếng Việt
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#28a745",
                  marginBottom: "15px",
                }}
              >
                {currentVocab.vietnamese}
              </div>

              <div
                style={{
                  fontSize: "18px",
                  color: "#007bff",
                  marginBottom: "10px",
                }}
              >
                {currentVocab.english}
              </div>

              {currentVocab.pronunciation && (
                <div
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  {currentVocab.pronunciation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={prevCard}
          className="btn btn-secondary"
          style={{
            padding: "12px 20px",
            backgroundColor: "#6c757d",
            fontSize: "16px",
          }}
        >
          ←
        </button>

        <button
          onClick={toggleAnswer}
          className="btn btn-primary"
          style={{
            padding: "12px 20px",
            fontSize: "14px",
          }}
        >
          {showAnswer ? "Ẩn nghĩa" : "Hiện nghĩa"}
        </button>

        <button
          onClick={nextCard}
          className="btn btn-secondary"
          style={{
            padding: "12px 20px",
            backgroundColor: "#6c757d",
            fontSize: "16px",
          }}
        >
          →
        </button>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={markAsStudied}
          className="btn btn-info"
          style={{
            padding: "15px 25px",
            fontSize: "16px",
            backgroundColor: "#17a2b8",
            fontWeight: "bold",
          }}
          disabled={currentVocab.studied}
        >
          📖 {currentVocab.studied ? "Đã học" : "Đánh dấu đã học"}
        </button>

        <button
          onClick={markAsMemorized}
          className="btn btn-success"
          style={{
            padding: "15px 25px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ✅ Đã nhớ từ này
        </button>

        {pagination.hasNext && (
          <button
            onClick={loadNextSet}
            className="btn btn-secondary"
            style={{
              padding: "15px 25px",
              fontSize: "16px",
              backgroundColor: "#6c757d",
            }}
          >
            📚 Bộ từ tiếp theo
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: "30px" }}>
        <h3>Hướng dẫn:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Click vào thẻ hoặc nút "Hiện nghĩa" để xem đáp án</li>
          <li>Sử dụng nút "Trước" và "Sau" để điều hướng</li>
          <li>Click 🔊 để nghe phát âm</li>
          <li>
            📖 <strong>"Đã học":</strong> Từ này sẽ không được ưu tiên hiển thị
            nữa (nhưng vẫn xuất hiện trong ôn tập)
          </li>
          <li>
            ✅ <strong>"Đã nhớ":</strong> Từ này sẽ được loại bỏ hoàn toàn khỏi
            ôn tập
          </li>
          <li>
            Hệ thống ưu tiên hiển thị:{" "}
            <em>Chưa học → Học lâu nhất → Chưa ôn → Ôn lâu nhất</em>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlashcardGame;
