import React, { useState, useEffect, useCallback } from "react";
import vocabularyAPI from "../services/api";

const wordTypes = [
  { value: "all", label: "Tất cả" },
  { value: "noun", label: "Danh từ (Noun)" },
  { value: "verb", label: "Động từ (Verb)" },
  { value: "adjective", label: "Tính từ (Adjective)" },
  { value: "adverb", label: "Trạng từ (Adverb)" },
  { value: "preposition", label: "Giới từ (Preposition)" },
  { value: "conjunction", label: "Liên từ (Conjunction)" },
  { value: "interjection", label: "Thán từ (Interjection)" },
  { value: "pronoun", label: "Đại từ (Pronoun)" },
  { value: "other", label: "Khác (Other)" },
];

const VocabularyList = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWordType, setSelectedWordType] = useState("all");
  const [selectedMemorized, setSelectedMemorized] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalItems: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    english: "",
    vietnamese: "",
    wordType: "other",
    pronunciation: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Tải danh sách từ vựng
  const loadVocabularies = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: 10,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedWordType !== "all" && { wordType: selectedWordType }),
          ...(selectedMemorized !== "all" && { memorized: selectedMemorized }),
        };

        const response = await vocabularyAPI.getAllVocabularies(params);
        setVocabularies(response.data.vocabularies);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error loading vocabularies:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedWordType, selectedMemorized]
  );

  // Load ban đầu và khi filter thay đổi
  useEffect(() => {
    loadVocabularies(1);
  }, [loadVocabularies]);

  // Handle search với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || searchTerm === "") {
        loadVocabularies(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Bắt đầu chỉnh sửa
  const startEdit = (vocab) => {
    setEditingId(vocab._id);
    setEditFormData({
      english: vocab.english,
      vietnamese: vocab.vietnamese,
      wordType: vocab.wordType || "other",
      pronunciation: vocab.pronunciation || "",
    });
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      english: "",
      vietnamese: "",
      wordType: "other",
      pronunciation: "",
    });
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    if (!editFormData.english.trim() || !editFormData.vietnamese.trim()) {
      alert("Vui lòng nhập đầy đủ từ tiếng Anh và nghĩa tiếng Việt");
      return;
    }

    setIsUpdating(true);
    try {
      await vocabularyAPI.updateVocabulary(editingId, editFormData);
      await loadVocabularies(pagination.current);
      setEditingId(null);
      setEditFormData({
        english: "",
        vietnamese: "",
        wordType: "other",
        pronunciation: "",
      });
    } catch (error) {
      alert(
        error.response?.data?.error || "Có lỗi xảy ra khi cập nhật từ vựng"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Xóa từ vựng
  const deleteVocabulary = async (id, english) => {
    if (window.confirm(`Bạn có chắc muốn xóa từ "${english}"?`)) {
      try {
        await vocabularyAPI.deleteVocabulary(id);
        await loadVocabularies(pagination.current);
      } catch (error) {
        alert(error.response?.data?.error || "Có lỗi xảy ra khi xóa từ vựng");
      }
    }
  };

  // Toggle memorized status
  const toggleMemorized = async (id, currentStatus, english) => {
    try {
      await vocabularyAPI.updateMemorized(id, !currentStatus);
      await loadVocabularies(pagination.current);
    } catch (error) {
      alert(
        error.response?.data?.error || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
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

  // Đổi trang
  const changePage = (page) => {
    loadVocabularies(page);
  };

  const getWordTypeLabel = (type) => {
    const wordType = wordTypes.find((t) => t.value === type);
    return wordType ? wordType.label : "Khác";
  };

  if (isLoading && vocabularies.length === 0) {
    return (
      <div className="page">
        <div className="loading">Đang tải danh sách từ vựng...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Danh Sách Từ Vựng</h1>

      {/* Bộ lọc và tìm kiếm */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1", minWidth: "200px" }}>
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ minWidth: "150px" }}>
          <select
            value={selectedWordType}
            onChange={(e) => setSelectedWordType(e.target.value)}
            style={{
              padding: "10px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
              width: "100%",
            }}
          >
            {wordTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: "130px" }}>
          <select
            value={selectedMemorized}
            onChange={(e) => setSelectedMemorized(e.target.value)}
            style={{
              padding: "10px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
              width: "100%",
            }}
          >
            <option value="all">Tất cả</option>
            <option value="false">Chưa nhớ</option>
            <option value="true">Đã nhớ</option>
          </select>
        </div>
      </div>

      {/* Thống kê */}
      <div style={{ marginBottom: "20px", color: "#666" }}>
        <p>
          Tìm thấy {pagination.totalItems} từ vựng
          {searchTerm && ` cho từ khóa "${searchTerm}"`}
          {selectedWordType !== "all" &&
            ` - ${getWordTypeLabel(selectedWordType)}`}
          {selectedMemorized !== "all" &&
            ` - ${selectedMemorized === "true" ? "Đã nhớ" : "Chưa nhớ"}`}
        </p>
      </div>

      {/* Danh sách từ vựng */}
      {vocabularies.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>Không tìm thấy từ vựng nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {vocabularies.map((vocab) => (
              <div
                key={vocab._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  position: "relative",
                }}
              >
                {editingId === vocab._id ? (
                  // Form chỉnh sửa
                  <div>
                    <div style={{ marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={editFormData.english}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            english: e.target.value,
                          }))
                        }
                        placeholder="Từ tiếng Anh"
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />

                      <input
                        type="text"
                        value={editFormData.vietnamese}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            vietnamese: e.target.value,
                          }))
                        }
                        placeholder="Nghĩa tiếng Việt"
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />

                      <select
                        value={editFormData.wordType}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            wordType: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          marginBottom: "8px",
                        }}
                      >
                        {wordTypes.slice(1).map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={editFormData.pronunciation}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            pronunciation: e.target.value,
                          }))
                        }
                        placeholder="Phiên âm"
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={saveEdit}
                        disabled={isUpdating}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {isUpdating ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  // Hiển thị thông tin
                  <div>
                    <div style={{ marginBottom: "10px" }}>
                      <h3
                        style={{
                          margin: "0 0 5px 0",
                          color: "#007bff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {vocab.english}
                        <button
                          onClick={() => speakWord(vocab.english)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                          title="Phát âm"
                        >
                          🔊
                        </button>
                      </h3>
                      <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                        {vocab.vietnamese}
                      </p>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            background: "#e9ecef",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            marginRight: "8px",
                          }}
                        >
                          {getWordTypeLabel(vocab.wordType)}
                        </span>
                        {vocab.pronunciation && (
                          <span style={{ fontStyle: "italic" }}>
                            {vocab.pronunciation}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginBottom: "8px",
                        }}
                      >
                        Ôn tập: {vocab.reviewCount} lần
                        {vocab.lastReviewed && (
                          <>
                            {" "}
                            • Lần cuối:{" "}
                            {new Date(vocab.lastReviewed).toLocaleDateString(
                              "vi-VN"
                            )}
                          </>
                        )}
                      </div>

                      {/* Memorized Status */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={vocab.memorized || false}
                            onChange={() =>
                              toggleMemorized(
                                vocab._id,
                                vocab.memorized,
                                vocab.english
                              )
                            }
                            style={{ cursor: "pointer" }}
                          />
                          <span
                            style={{
                              color: vocab.memorized ? "#28a745" : "#6c757d",
                              fontWeight: vocab.memorized ? "bold" : "normal",
                            }}
                          >
                            {vocab.memorized ? "✅ Đã nhớ" : "❌ Chưa nhớ"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => startEdit(vocab)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          deleteVocabulary(vocab._id, vocab.english)
                        }
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {pagination.total > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "30px",
              }}
            >
              <div className="pagination-controls">
                <button
                  onClick={() => changePage(pagination.current - 1)}
                  disabled={pagination.current === 1 || isLoading}
                  className="pagination-btn"
                  title="Trang trước"
                >
                  ← Trước
                </button>

                {/* Numbered pagination */}
                <div className="page-numbers">
                  {Array.from({ length: pagination.total }, (_, index) => {
                    const pageNum = index + 1;
                    const isCurrent = pageNum === pagination.current;
                    const isNearby =
                      Math.abs(pageNum - pagination.current) <= 2;

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
                          className={`page-number ${
                            isCurrent ? "current" : ""
                          }`}
                          title={`Trang ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }

                    // Hiển thị dấu "..." cho các trang bị ẩn
                    if (pageNum === 2 && pagination.current > 4) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="page-ellipsis"
                        >
                          ...
                        </span>
                      );
                    }
                    if (
                      pageNum === pagination.total - 1 &&
                      pagination.current < pagination.total - 3
                    ) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="page-ellipsis"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>

                <button
                  onClick={() => changePage(pagination.current + 1)}
                  disabled={
                    pagination.current === pagination.total || isLoading
                  }
                  className="pagination-btn"
                  title="Trang sau"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyList;
