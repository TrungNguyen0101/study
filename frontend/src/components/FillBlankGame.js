import React, { useState, useEffect } from "react";
import vocabularyAPI from "../services/api";
import { speakEnglishWord } from "../utils/speechUtils";

const FillBlankGame = ({ onStatsUpdate, onGameComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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
      setUserAnswer("");
      setShowResult(false);
      setIsCorrect(false);
      const response = await vocabularyAPI.getFillBlankQuestion();
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error("Error loading question:", error);
      // Fallback: hiển thị thông báo không có câu hỏi
      setCurrentQuestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit đáp án
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    const isAnswerCorrect =
      userAnswer.trim().toLowerCase() === currentQuestion.english.toLowerCase();

    if (isAnswerCorrect) {
      // Khi trả lời đúng
      setIsCorrect(true);
      setShowResult(true);

      // Cập nhật thống kê
      const newStats = {
        correct: stats.correct + 1,
        wrong: stats.wrong,
        total: stats.total + 1,
      };
      setStats(newStats);

      // Cập nhật game session
      const newSession = {
        questionsAnswered: gameSession.questionsAnswered + 1,
        currentStreak: gameSession.currentStreak + 1,
        maxStreak: Math.max(
          gameSession.maxStreak,
          gameSession.currentStreak + 1
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

      // Cập nhật trạng thái review trong database
      vocabularyAPI
        .updateReview(currentQuestion.vocabularyId)
        .catch(console.error);
    } else {
      // Khi trả lời sai, cập nhật thống kê sai nhưng không chuyển câu
      const newStats = {
        correct: stats.correct,
        wrong: stats.wrong + 1,
        total: stats.total + 1,
      };
      setStats(newStats);

      // Cập nhật game session (reset streak)
      const newSession = {
        questionsAnswered: gameSession.questionsAnswered + 1,
        currentStreak: 0,
        maxStreak: gameSession.maxStreak,
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

      // Hiển thị kết quả sai và cho phép nhập lại
      setIsCorrect(false);
      setShowResult(true);
      // Không reset input để người dùng có thể sửa và submit lại
    }
  };

  // Xử lý nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && userAnswer.trim()) {
      handleSubmitAnswer();
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setUserAnswer(newValue);

    // Nếu đang hiển thị kết quả sai và người dùng bắt đầu nhập lại
    if (showResult && !isCorrect && newValue.trim() !== "") {
      setShowResult(false); // Ẩn kết quả để cho phép submit lại
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

  return (
    <div className="page">
      {/* Câu hỏi */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <div
          className="question-card"
          style={{
            width: "100%",
            maxWidth: "600px",
            backgroundColor: "white",
            border: "2px solid #007bff",
            borderRadius: "15px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Từ tiếng Việt */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#007bff",
              marginBottom: "20px",
            }}
          >
            {currentQuestion.vietnamese}
          </div>

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

          {/* Gợi ý */}
          <div
            style={{
              fontSize: "18px",
              color: "#28a745",
              marginBottom: "25px",
              fontStyle: "italic",
            }}
          >
            💡 Gợi ý: Bắt đầu bằng "{currentQuestion.hint}..."
          </div>
        </div>
      </div>

      {/* Ô nhập đáp án */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "25px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <input
            type="text"
            value={userAnswer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập từ tiếng Anh..."
            disabled={showResult && isCorrect} // Chỉ disable khi trả lời đúng
            style={{
              width: "100%",
              padding: "15px 20px",
              fontSize: "20px",
              border: showResult
                ? isCorrect
                  ? "3px solid #28a745"
                  : "3px solid #dc3545"
                : "3px solid #007bff",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "500",
              backgroundColor: showResult && isCorrect ? "#f8f9fa" : "white",
              color: showResult && isCorrect ? "#28a745" : "#333",
            }}
          />
        </div>
      </div>

      {/* Nút Submit */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button
          onClick={handleSubmitAnswer}
          disabled={!userAnswer.trim()}
          className="btn btn-primary"
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            fontWeight: "bold",
            opacity: userAnswer.trim() ? 1 : 0.6,
          }}
        >
          {!showResult ? "✅ Kiểm tra đáp án" : "🔄 Thử lại"}
        </button>
      </div>

      {/* Kết quả và điều khiển */}
      {showResult && (
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div
            style={{
              fontSize: "24px",
              marginBottom: "15px",
              fontWeight: "bold",
              color: isCorrect ? "#28a745" : "#dc3545",
            }}
          >
            {isCorrect ? "🎉 Chính xác!" : "❌ Sai rồi!"}
          </div>

          {/* Hiển thị đáp án đúng */}
          <div
            style={{
              fontSize: "20px",
              color: "#007bff",
              marginBottom: "15px",
              fontWeight: "bold",
            }}
          >
            Đáp án đúng: {currentQuestion.english}
          </div>

          {/* Phiên âm */}
          {currentQuestion.pronunciation && (
            <div
              style={{
                fontSize: "18px",
                color: "#666",
                fontStyle: "italic",
                marginBottom: "20px",
              }}
            >
              /{currentQuestion.pronunciation}/
            </div>
          )}

          {/* Nút phát âm */}
          <button
            onClick={() => speakWord(currentQuestion.english)}
            style={{
              background: "none",
              border: "2px solid #007bff",
              borderRadius: "50px",
              fontSize: "20px",
              cursor: "pointer",
              padding: "10px 20px",
              marginBottom: "20px",
              color: "#007bff",
              fontWeight: "500",
            }}
            title="Phát âm"
          >
            🔊 Nghe phát âm
          </button>

          {/* Hiển thị thông báo */}
          {isCorrect ? (
            <div
              style={{
                fontSize: "16px",
                color: "#28a745",
                fontStyle: "italic",
                marginTop: "15px",
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
                marginTop: "15px",
              }}
            >
              💡 Hãy thử lại cho đến khi đúng!
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
          marginBottom: "30px",
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
          <li>Đọc từ tiếng Việt và loại từ được hiển thị</li>
          <li>Nhập từ tiếng Anh tương ứng vào ô trống</li>
          <li>Nhấn Enter hoặc click "Kiểm tra đáp án" để submit</li>
          <li>Click 🔊 để nghe phát âm từ tiếng Anh</li>
          <li>
            ✅ <strong>Trả lời đúng:</strong> Tự động phát âm và chuyển câu sau
            2 giây
          </li>
          <li>
            ❌ <strong>Trả lời sai:</strong> Hiển thị đáp án đúng, vẫn cho phép
            nhập lại cho đến khi đúng
          </li>
          <li>Hệ thống ưu tiên hiển thị từ chưa học và học lâu nhất</li>
          <li>Gợi ý 2 chữ cái đầu tiên để hỗ trợ</li>
        </ul>
      </div>
    </div>
  );
};

export default FillBlankGame;
