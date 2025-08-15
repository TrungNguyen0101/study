import React, { useState, useEffect } from "react";
import MultipleChoiceGame from "./MultipleChoiceGame";
import FillBlankGame from "./FillBlankGame";

const CombinedGame = () => {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameKey, setGameKey] = useState(0); // Thêm key để force re-render
  const [gameStats, setGameStats] = useState({
    multipleChoice: { correct: 0, wrong: 0, total: 0 },
    fillBlank: { correct: 0, wrong: 0, total: 0 },
    combined: {
      correct: 0,
      wrong: 0,
      total: 0,
      currentStreak: 0,
      maxStreak: 0,
    },
  });

  // Chọn game ngẫu nhiên
  const selectRandomGame = () => {
    const games = ["multiple-choice", "fill-blank"];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    setCurrentGame(randomGame);
    setGameKey((prev) => prev + 1); // Tăng key để force re-render
  };

  // Chuyển game ngẫu nhiên sau mỗi câu hỏi
  const switchToRandomGame = () => {
    console.log("🔄 Switching to random game...");
    const games = ["multiple-choice", "fill-blank"];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    console.log(`🎲 Selected game: ${randomGame}`);
    setCurrentGame(randomGame);
    setGameKey((prev) => prev + 1); // Tăng key để force re-render
  };

  // Cập nhật thống kê từ các game con
  const updateGameStats = (gameType, newStats) => {
    setGameStats((prev) => {
      const updated = { ...prev };

      // Cập nhật thống kê của game cụ thể
      updated[gameType] = newStats;

      // Tính toán thống kê tổng hợp
      const totalCorrect =
        updated.multipleChoice.correct + updated.fillBlank.correct;
      const totalWrong = updated.multipleChoice.wrong + updated.fillBlank.wrong;
      const totalQuestions =
        updated.multipleChoice.total + updated.fillBlank.total;

      updated.combined = {
        correct: totalCorrect,
        wrong: totalWrong,
        total: totalQuestions,
        currentStreak: Math.max(
          updated.multipleChoice.currentStreak || 0,
          updated.fillBlank.currentStreak || 0
        ),
        maxStreak: Math.max(
          updated.multipleChoice.maxStreak || 0,
          updated.fillBlank.maxStreak || 0
        ),
      };

      return updated;
    });
  };

  // Chuyển sang game khác
  const switchToOtherGame = () => {
    if (currentGame === "multiple-choice") {
      setCurrentGame("fill-blank");
    } else {
      setCurrentGame("multiple-choice");
    }
    setGameKey((prev) => prev + 1); // Tăng key để force re-render
  };

  // Restart tất cả games
  const restartAllGames = () => {
    setGameStats({
      multipleChoice: { correct: 0, wrong: 0, total: 0 },
      fillBlank: { correct: 0, wrong: 0, total: 0 },
      combined: {
        correct: 0,
        wrong: 0,
        total: 0,
        currentStreak: 0,
        maxStreak: 0,
      },
    });
    selectRandomGame();
  };

  // Load game đầu tiên
  useEffect(() => {
    selectRandomGame();
  }, []);

  // Render game hiện tại
  const renderCurrentGame = () => {
    console.log(`🎮 Rendering game: ${currentGame}, key: ${gameKey}`);
    switch (currentGame) {
      case "multiple-choice":
        return (
          <MultipleChoiceGame
            key={`multiple-choice-${gameKey}`}
            onStatsUpdate={(stats) => updateGameStats("multipleChoice", stats)}
            onGameComplete={switchToRandomGame}
          />
        );
      case "fill-blank":
        return (
          <FillBlankGame
            key={`fill-blank-${gameKey}`}
            onStatsUpdate={(stats) => updateGameStats("fillBlank", stats)}
            onGameComplete={switchToRandomGame}
          />
        );
      default:
        return <div>Đang tải game...</div>;
    }
  };

  return (
    <div>
      {/* Render game hiện tại */}
      {renderCurrentGame()}

      {/* Hướng dẫn */}
      <div style={{ marginTop: "40px" }}>
        <h3>🎯 Hướng dẫn Game Kết Hợp:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>
            <strong>🧠 Quiz Trắc Nghiệm:</strong> Chọn nghĩa tiếng Việt đúng cho
            từ tiếng Anh
          </li>
          <li>
            <strong>✏️ Điền Từ:</strong> Nhập từ tiếng Anh tương ứng với nghĩa
            tiếng Việt
          </li>
          <li>
            <strong>🔄 Tự động chuyển đổi:</strong> Sau mỗi câu hỏi, hệ thống sẽ
            tự động chuyển sang game khác ngẫu nhiên
          </li>
          <li>
            <strong>⏱️ Thời gian:</strong> Trả lời đúng → chuyển sau 2 giây, trả
            lời sai → chuyển sau 3 giây
          </li>
          <li>
            <strong>🔄 Hoàn toàn tự động:</strong> Không cần bấm nút gì, hệ
            thống tự động chuyển game sau mỗi câu hỏi
          </li>
          <li>Thống kê được tổng hợp từ cả 2 game</li>
          <li>Streak được tính dựa trên kết quả tốt nhất của cả 2 game</li>
        </ul>
      </div>
    </div>
  );
};

export default CombinedGame;
