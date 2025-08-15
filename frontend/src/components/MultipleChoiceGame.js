import React, { useState, useEffect } from "react";
import vocabularyAPI from "../services/api";
import { speakEnglishWord, debugVoices } from "../utils/speechUtils";

const MultipleChoiceGame = ({ onStatsUpdate, onGameComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0,
    total: 0,
  });
  const [gameSession, setGameSession] = useState({
    questionsAnswered: 0,
    currentStreak: 0,
    maxStreak: 0,
  });

  // Phát âm từ tiếng Anh
  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Load câu hỏi mới
  const loadNewQuestion = async () => {
    try {
      setIsLoading(true);
      setSelectedAnswer(null);
      setShowResult(false);
      const response = await vocabularyAPI.getMultipleChoiceQuestion();
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error("Error loading question:", error);
      // Fallback: hiển thị thông báo không có câu hỏi
      setCurrentQuestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chọn đáp án
  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswerIndex;

    // Cập nhật thống kê
    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      wrong: stats.wrong + (isCorrect ? 0 : 1),
      total: stats.total + 1,
    };
    setStats(newStats);

    // Cập nhật game session
    const newSession = {
      questionsAnswered: gameSession.questionsAnswered + 1,
      currentStreak: isCorrect ? gameSession.currentStreak + 1 : 0,
      maxStreak: Math.max(
        gameSession.maxStreak,
        isCorrect ? gameSession.currentStreak + 1 : 0
      ),
    };
    setGameSession(newSession);

    // Gọi callback để cập nhật thống kê tổng hợp
    if (onStatsUpdate) {
      onStatsUpdate({
        ...newStats,
        currentStreak: newSession.currentStreak,
        maxStreak: newSession.maxStreak,
      });
    }

    // Phát âm từ tiếng Anh và tự động chuyển câu khi trả lời đúng
    if (isCorrect) {
      setTimeout(() => {
        speakWord(currentQuestion.english);
      }, 500);

      // Tự động chuyển sang câu tiếp theo sau khi phát âm
      setTimeout(() => {
        console.log("⏰ Timeout triggered for correct answer");
        if (onGameComplete) {
          console.log("🎯 Calling onGameComplete callback");
          onGameComplete(); // Gọi callback để chuyển game
        } else {
          console.log("🔄 Fallback: loading new question");
          loadNewQuestion(); // Fallback về logic cũ
        }
      }, 2000); // Delay 2 giây để người dùng có thời gian nghe phát âm và xem kết quả
    } else {
      // Khi trả lời sai, cũng tự động chuyển game sau 3 giây
      setTimeout(() => {
        console.log("⏰ Timeout triggered for wrong answer");
        if (onGameComplete) {
          console.log("🎯 Calling onGameComplete callback");
          onGameComplete(); // Gọi callback để chuyển game
        } else {
          console.log("🔄 Fallback: loading new question");
          loadNewQuestion(); // Fallback về logic cũ
        }
      }, 3000); // Delay 3 giây để người dùng có thời gian xem đáp án đúng
    }

    // Cập nhật trạng thái review trong database
    if (isCorrect) {
      vocabularyAPI
        .updateReview(currentQuestion.vocabularyId)
        .catch(console.error);
    }
  };

  // Tiếp tục câu hỏi tiếp theo
  const handleNextQuestion = () => {
    loadNewQuestion();
  };

  // Restart game
  const restartGame = () => {
    setStats({ correct: 0, wrong: 0, total: 0 });
    setGameSession({ questionsAnswered: 0, currentStreak: 0, maxStreak: 0 });
    loadNewQuestion();
  };

  // Load câu hỏi đầu tiên
  useEffect(() => {
    loadNewQuestion();
  }, []);

  if (isLoading) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              fontSize: "48px",
              animation: "spin 2s linear infinite",
              marginBottom: "20px",
            }}
          >
            ⏳
          </div>
          <h3>Đang tải câu hỏi...</h3>
          <p style={{ color: "#666", marginTop: "10px" }}>
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>🎉</div>
          <h3 style={{ color: "#28a745", marginBottom: "15px" }}>
            Xuất sắc! Bạn đã học hết từ vựng!
          </h3>
          <p
            style={{
              color: "#666",
              marginBottom: "25px",
              maxWidth: "400px",
              margin: "0 auto 25px",
            }}
          >
            Không còn từ nào để luyện tập. Hãy thêm từ vựng mới để tiếp tục học.
          </p>
          <button onClick={loadNewQuestion} className="btn btn-primary">
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  const getAnswerButtonClass = (index) => {
    if (!showResult) {
      return selectedAnswer === index
        ? "btn answer-btn selected"
        : "btn answer-btn";
    }

    if (index === currentQuestion.correctAnswerIndex) {
      return "btn answer-btn correct";
    }

    if (
      selectedAnswer === index &&
      index !== currentQuestion.correctAnswerIndex
    ) {
      return "btn answer-btn wrong";
    }

    return "btn answer-btn disabled";
  };

  return (
    <div className="page">
      {/* Câu hỏi */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "15px",
        }}
      >
        <div
          className="question-card"
          style={{
            width: "100%",
            maxWidth: "500px",
            backgroundColor: "white",
            border: "2px solid #007bff",
            borderRadius: "15px",
            padding: "10px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Từ tiếng Anh */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "#007bff",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            {currentQuestion.english}
            <button
              onClick={() => speakWord(currentQuestion.english)}
              style={{
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                padding: "4px",
              }}
              title="Phát âm"
            >
              🔊
            </button>
          </div>

          {/* Phiên âm */}
          {currentQuestion.pronunciation && (
            <div
              style={{
                fontSize: "20px",
                color: "#666",
                fontStyle: "italic",
                marginBottom: "15px",
              }}
            >
              /{currentQuestion.pronunciation}/
            </div>
          )}

          {/* Loại từ */}
          {currentQuestion.wordType && (
            <div
              style={{
                fontSize: "16px",
                color: "#6c757d",
                backgroundColor: "#f8f9fa",
                padding: "8px 16px",
                borderRadius: "20px",
                display: "inline-block",
                marginBottom: "20px",
                fontWeight: "500",
              }}
            >
              {currentQuestion.wordType}
            </div>
          )}
        </div>
      </div>

      {/* Đáp án */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "5px",
          marginBottom: "15px",
          maxWidth: "800px",
          margin: "0 auto 15px",
        }}
      >
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            className={getAnswerButtonClass(index)}
            onClick={() => handleAnswerSelect(index)}
            disabled={showResult}
            style={{
              padding: "10px",
              fontSize: "18px",
              borderRadius: "10px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transition: "all 0.3s ease",
              fontWeight: "500",
            }}
          >
            {answer}
          </button>
        ))}
      </div>

      {/* Kết quả và điều khiển */}
      {showResult && (
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <div
            style={{
              fontSize: "24px",
              marginBottom: "15px",
              fontWeight: "bold",
              color:
                selectedAnswer === currentQuestion.correctAnswerIndex
                  ? "#28a745"
                  : "#dc3545",
            }}
          >
            {selectedAnswer === currentQuestion.correctAnswerIndex
              ? "🎉 Chính xác!"
              : "❌ Sai rồi!"}
          </div>

          {selectedAnswer !== currentQuestion.correctAnswerIndex && (
            <div
              style={{ marginBottom: "15px", fontSize: "16px", color: "#666" }}
            >
              Đáp án đúng:{" "}
              <strong style={{ color: "#28a745" }}>
                {currentQuestion.answers[currentQuestion.correctAnswerIndex]}
              </strong>
            </div>
          )}

          {/* Hiển thị thông báo tự động chuyển */}
          {selectedAnswer === currentQuestion.correctAnswerIndex ? (
            <div
              style={{
                fontSize: "16px",
                color: "#28a745",
                fontStyle: "italic",
                marginTop: "10px",
              }}
            >
              🔊 Đang phát âm... Tự động chuyển câu sau 2 giây
            </div>
          ) : (
            <div
              style={{
                fontSize: "16px",
                color: "#dc3545",
                fontStyle: "italic",
                marginTop: "10px",
              }}
            >
              ⏰ Tự động chuyển câu sau 3 giây
            </div>
          )}
        </div>
      )}

      {/* Nút điều khiển */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={restartGame}
          className="btn btn-secondary"
          style={{
            padding: "12px 20px",
            fontSize: "16px",
          }}
        >
          🔄 Bắt đầu lại
        </button>

        <button
          onClick={loadNewQuestion}
          className="btn btn-warning"
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            backgroundColor: "#ffc107",
            borderColor: "#ffc107",
          }}
        >
          ⏭️ Bỏ qua
        </button>
      </div>

      {/* Hướng dẫn */}
      <div style={{ marginTop: "40px" }}>
        <h3>Hướng dẫn:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Đọc từ tiếng Anh và các thông tin (phiên âm, loại từ)</li>
          <li>Chọn nghĩa tiếng Việt đúng trong 4 đáp án</li>
          <li>Click 🔊 để nghe phát âm từ</li>
          <li>
            ✅ <strong>Trả lời đúng:</strong> Tự động phát âm và chuyển câu sau
            2 giây
          </li>
          <li>
            ❌ <strong>Trả lời sai:</strong> Hiển thị đáp án đúng, tự động
            chuyển câu sau 3 giây
          </li>
          <li>Hệ thống ưu tiên hiển thị từ chưa học và học lâu nhất</li>
          <li>
            Đáp án sai được tạo ngẫu nhiên từ các từ khác trong bộ từ vựng
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MultipleChoiceGame;
