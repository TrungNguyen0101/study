import React, { useState, useEffect, useCallback } from "react";
import { vocabularyAPI } from "../services/api";

const ReviewGame = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [cardCount, setCardCount] = useState(16); // Mặc định 20 thẻ (10 cặp)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  });
  const [stats, setStats] = useState({
    totalPairs: 0,
    matchedPairs: 0,
    attempts: 0,
  });

  // Tính năng phát âm
  const speakEnglish = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Tạo cards cho game
  const createGameCards = useCallback((vocabs) => {
    const cards = [];

    vocabs.forEach((vocab, index) => {
      cards.push({
        id: `en-${vocab._id}`,
        text: vocab.english,
        type: "english",
        pairId: vocab._id,
        vocabData: vocab,
      });

      cards.push({
        id: `vi-${vocab._id}`,
        text: vocab.vietnamese,
        type: "vietnamese",
        pairId: vocab._id,
        vocabData: vocab,
      });
    });

    return shuffleArray(cards);
  }, []);

  // Load vocabularies
  const loadVocabularies = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const pairsCount = Math.floor(cardCount / 2); // Số cặp = số thẻ / 2
        const response = await vocabularyAPI.getReviewVocabularies({
          limit: pairsCount,
          page: page,
        });

        if (response.data.vocabularies) {
          const vocabs = response.data.vocabularies;
          setPagination(response.data.pagination);

          if (vocabs.length === 0) {
            setGameCards([]);
            setStats((prev) => ({ ...prev, totalPairs: 0 }));
          } else {
            const cards = createGameCards(vocabs);
            setGameCards(cards);
            setVocabularies(vocabs);
            setStats((prev) => ({
              ...prev,
              totalPairs: vocabs.length,
              matchedPairs: 0,
              attempts: 0,
            }));
          }
        } else {
          // Fallback cho API response cũ
          const vocabs = response.data;
          if (vocabs.length === 0) {
            setGameCards([]);
            setStats((prev) => ({ ...prev, totalPairs: 0 }));
          } else {
            const cards = createGameCards(vocabs);
            setGameCards(cards);
            setVocabularies(vocabs);
            setStats((prev) => ({
              ...prev,
              totalPairs: vocabs.length,
              matchedPairs: 0,
              attempts: 0,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading vocabularies:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [createGameCards, cardCount]
  );

  // Handle card click
  const handleCardClick = (card) => {
    if (
      selectedCards.length >= 2 ||
      matchedPairs.has(card.pairId) ||
      selectedCards.some((selected) => selected.id === card.id)
    ) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setStats((prev) => ({ ...prev, attempts: prev.attempts + 1 }));

      // Check if pair matches
      if (newSelected[0].pairId === newSelected[1].pairId) {
        // Correct pair
        setTimeout(() => {
          setMatchedPairs((prev) => new Set([...prev, card.pairId]));
          setSelectedCards([]);
          setStats((prev) => ({
            ...prev,
            matchedPairs: prev.matchedPairs + 1,
          }));

          // Phát âm từ tiếng Anh
          const englishCard = newSelected.find((c) => c.type === "english");
          if (englishCard) {
            speakEnglish(englishCard.text);
          }

          // Cập nhật trạng thái review trong database
          vocabularyAPI.updateReview(card.pairId).catch(console.error);
        }, 500);
      } else {
        // Wrong pair
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Check if game is complete
  useEffect(() => {
    if (vocabularies.length > 0 && matchedPairs.size === vocabularies.length) {
      setGameComplete(true);
    }
  }, [matchedPairs, vocabularies]);

  // Load next round
  const loadNextRound = () => {
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setGameComplete(false);

    // Load next page if available, otherwise reload current page
    if (pagination.hasNext) {
      setCurrentPage((prev) => prev + 1);
      loadVocabularies(currentPage + 1);
    } else {
      loadVocabularies(currentPage);
    }
  };

  // Change page
  const changePage = (page) => {
    setCurrentPage(page);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setGameComplete(false);
    loadVocabularies(page);
  };

  // Handle card count change
  const handleCardCountChange = (newCount) => {
    setCardCount(newCount);
    setCurrentPage(1);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setGameComplete(false);
    // loadVocabularies will be called automatically due to dependency
  };

  // Initial load
  useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

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
          <h3>Đang tải từ vựng...</h3>
          <p style={{ color: "#666", marginTop: "10px" }}>
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (gameCards.length === 0) {
    return (
      <div className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>🎉</div>
          <h3 style={{ color: "#28a745", marginBottom: "15px" }}>
            Xuất sắc! Bạn đã nhớ tất cả từ vựng!
          </h3>
          <p
            style={{
              color: "#666",
              marginBottom: "25px",
              maxWidth: "400px",
              margin: "0 auto 25px",
            }}
          >
            Không còn từ nào cần ôn tập. Hãy thêm từ vựng mới hoặc kiểm tra lại
            để tiếp tục học.
          </p>
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => loadVocabularies(1)}
              className="btn btn-primary"
            >
              🔄 Kiểm tra lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="page">
        <div className="game-complete">
          <h2>🎉 Hoàn thành!</h2>
          <div className="stats">
            <div className="stat-item">
              <h3>{stats.matchedPairs}</h3>
              <p>Cặp đúng</p>
            </div>
            <div className="stat-item">
              <h3>{stats.attempts}</h3>
              <p>Lượt thử</p>
            </div>
            <div className="stat-item">
              <h3>
                {Math.round((stats.matchedPairs / stats.attempts) * 100) || 0}%
              </h3>
              <p>Tỷ lệ chính xác</p>
            </div>
          </div>
          <button onClick={loadNextRound} className="btn btn-success">
            Ôn tập tiếp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Controls */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cardCount" style={{ fontWeight: "bold" }}>
            Số thẻ:
          </label>
          <select
            id="cardCount"
            value={cardCount}
            onChange={(e) => handleCardCountChange(parseInt(e.target.value))}
            style={{
              padding: "8px 12px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            <option value={8}>8 thẻ (4 cặp)</option>
            <option value={12}>12 thẻ (6 cặp)</option>
            <option value={16}>16 thẻ (8 cặp)</option>
            <option value={20}>20 thẻ (10 cặp)</option>
            <option value={24}>24 thẻ (12 cặp)</option>
            <option value={32}>32 thẻ (16 cặp)</option>
          </select>
        </div>
      </div>

      <div className="stats">
        <div className="stat-item">
          <h3>
            {stats.matchedPairs}/{stats.totalPairs}
          </h3>
          <p>Cặp đã ghép</p>
        </div>
        <div className="stat-item">
          <h3>{stats.attempts}</h3>
          <p>Lượt thử</p>
        </div>
        {stats.attempts > 0 && (
          <div className="stat-item">
            <h3>{Math.round((stats.matchedPairs / stats.attempts) * 100)}%</h3>
            <p>Tỷ lệ chính xác</p>
          </div>
        )}
      </div>

      <div
        className="game-grid"
        style={{
          gridTemplateColumns:
            cardCount <= 16
              ? "repeat(4, 1fr)"
              : cardCount <= 24
              ? "repeat(6, 1fr)"
              : "repeat(8, 1fr)",
          maxWidth:
            cardCount <= 16 ? "600px" : cardCount <= 24 ? "800px" : "1000px",
        }}
      >
        {gameCards.map((card) => {
          const isSelected = selectedCards.some(
            (selected) => selected.id === card.id
          );
          const isMatched = matchedPairs.has(card.pairId);
          const isWrong =
            selectedCards.length === 2 &&
            !isMatched &&
            isSelected &&
            selectedCards[0].pairId !== selectedCards[1].pairId;

          return (
            <div
              key={card.id}
              className={`card ${card.type} ${isSelected ? "selected" : ""} ${
                isMatched ? "matched" : ""
              } ${isWrong ? "wrong" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {card.text}
            </div>
          );
        })}
      </div>

      {/* Pagination Info */}
      {pagination.total > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            color: "#666",
            marginTop: "10px",
          }}
          className="pagination-info"
        >
          <span>
            Trang {pagination.current}/{pagination.total} (
            {pagination.totalItems} từ chưa nhớ)
          </span>
          <div className="pagination-controls">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={!pagination.hasPrev || isLoading}
              className="pagination-btn"
              title="Trang trước"
            >
              ←
            </button>

            {/* Numbered pagination */}
            <div className="page-numbers">
              {Array.from({ length: pagination.total }, (_, index) => {
                const pageNum = index + 1;
                const isCurrent = pageNum === pagination.current;
                const isNearby = Math.abs(pageNum - pagination.current) <= 2;

                // Hiển thị tất cả trang nếu ít hơn 7 trang
                // Hoặc chỉ hiển thị trang gần trang hiện tại
                if (
                  pagination.total <= 7 ||
                  isNearby ||
                  pageNum === 1 ||
                  pageNum === pagination.total
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      disabled={isCurrent || isLoading}
                      className={`page-number ${isCurrent ? "current" : ""}`}
                      title={`Trang ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                }

                // Hiển thị dấu "..." cho các trang bị ẩn
                if (pageNum === 2 && pagination.current > 4) {
                  return (
                    <span key={`ellipsis-${pageNum}`} className="page-ellipsis">
                      ...
                    </span>
                  );
                }
                if (
                  pageNum === pagination.total - 1 &&
                  pagination.current < pagination.total - 3
                ) {
                  return (
                    <span key={`ellipsis-${pageNum}`} className="page-ellipsis">
                      ...
                    </span>
                  );
                }

                return null;
              })}
            </div>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={!pagination.hasNext || isLoading}
              className="pagination-btn"
              title="Trang sau"
            >
              →
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Hướng dẫn:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Nhấn vào 2 ô để ghép cặp từ tiếng Anh với nghĩa tiếng Việt</li>
          <li>Khi ghép đúng, từ sẽ được phát âm và biến mất</li>
          <li>Hoàn thành tất cả cặp để chuyển sang bài tiếp theo</li>
          <li>Ưu tiên hiển thị các từ chưa được ôn tập</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewGame;
