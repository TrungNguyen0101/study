import React, { useState, useCallback } from "react";
import { vocabularyAPI } from "../services/api";

const wordTypes = [
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

const AddVocabulary = () => {
  const [formData, setFormData] = useState({
    english: "",
    vietnamese: "",
    wordType: "other",
    pronunciation: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWordInfo, setIsLoadingWordInfo] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  // Lấy phiên âm khi nhấn button
  const fetchPronunciation = useCallback(async () => {
    if (!formData.english.trim() || formData.english.length < 2) {
      setMessage("Vui lòng nhập từ tiếng Anh trước");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    setIsLoadingWordInfo(true);
    try {
      const response = await vocabularyAPI.getWordInfo(formData.english.trim());
      const { pronunciation } = response.data;

      setFormData((prev) => ({
        ...prev,
        pronunciation: pronunciation || prev.pronunciation,
      }));

      if (pronunciation) {
        setMessage("Đã tạo phiên âm thành công!");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }
    } catch (error) {
      console.log("Could not fetch pronunciation:", error);
      const errorMessage =
        error.response?.status === 404
          ? "API phiên âm không khả dụng. Vui lòng nhập phiên âm thủ công."
          : "Không thể tạo phiên âm tự động. Vui lòng thử lại sau.";
      setMessage(errorMessage);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } finally {
      setIsLoadingWordInfo(false);
    }
  }, [formData.english]);

  // Lấy bản dịch tiếng Việt khi nhấn button
  const fetchTranslation = useCallback(async () => {
    if (!formData.english.trim() || formData.english.length < 2) {
      setMessage("Vui lòng nhập từ tiếng Anh trước");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    setIsLoadingTranslation(true);
    try {
      const response = await vocabularyAPI.getTranslation(
        formData.english.trim()
      );
      const { vietnamese, success } = response.data;

      setFormData((prev) => ({
        ...prev,
        vietnamese: vietnamese || prev.vietnamese,
      }));

      if (success) {
        setMessage("Đã tạo bản dịch thành công!");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      } else {
        setMessage("Bản dịch có thể chưa chính xác, vui lòng kiểm tra lại");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }
    } catch (error) {
      console.log("Could not fetch translation:", error);
      const errorMessage =
        error.response?.status === 404
          ? "API dịch thuật không khả dụng. Vui lòng nhập nghĩa thủ công."
          : "Không thể tạo bản dịch tự động. Vui lòng thử lại sau.";
      setMessage(errorMessage);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [formData.english]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.english.trim() || !formData.vietnamese.trim()) {
      setMessage("Vui lòng nhập đầy đủ từ tiếng Anh và nghĩa tiếng Việt");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      await vocabularyAPI.addVocabulary(formData);
      setMessage("Thêm từ vựng thành công!");
      setMessageType("success");
      setFormData({
        english: "",
        vietnamese: "",
        wordType: "other",
        pronunciation: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Có lỗi xảy ra khi thêm từ vựng"
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="page">
      <h1>Thêm Từ Vựng</h1>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
          <button
            onClick={clearMessage}
            style={{
              float: "right",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="english">Từ tiếng Anh:</label>
          <input
            type="text"
            id="english"
            name="english"
            value={formData.english}
            onChange={handleChange}
            placeholder="Nhập từ tiếng Anh..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="vietnamese">Nghĩa tiếng Việt:</label>
          <div className="pronunciation-input-group">
            <input
              type="text"
              id="vietnamese"
              name="vietnamese"
              value={formData.vietnamese}
              onChange={handleChange}
              placeholder="Nhập nghĩa tiếng Việt hoặc click nút tạo tự động..."
              disabled={isLoading}
              className="pronunciation-input"
            />
            <button
              type="button"
              onClick={fetchTranslation}
              disabled={
                isLoading || isLoadingTranslation || !formData.english.trim()
              }
              className="pronunciation-btn"
              style={{
                backgroundColor: isLoadingTranslation ? "#6c757d" : "#17a2b8",
                cursor:
                  isLoading || isLoadingTranslation || !formData.english.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isLoadingTranslation ? "Đang dịch..." : "🌐 Tạo nghĩa"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="wordType">Loại từ:</label>
          <select
            id="wordType"
            name="wordType"
            value={formData.wordType}
            onChange={handleChange}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "16px",
              backgroundColor: "white",
            }}
          >
            {wordTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pronunciation">Phiên âm:</label>
          <div className="pronunciation-input-group">
            <input
              type="text"
              id="pronunciation"
              name="pronunciation"
              value={formData.pronunciation}
              onChange={handleChange}
              placeholder="Nhập phiên âm hoặc click nút tạo tự động..."
              disabled={isLoading}
              className="pronunciation-input"
            />
            <button
              type="button"
              onClick={fetchPronunciation}
              disabled={
                isLoading || isLoadingWordInfo || !formData.english.trim()
              }
              className="pronunciation-btn"
              style={{
                backgroundColor: isLoadingWordInfo ? "#6c757d" : "#28a745",
                cursor:
                  isLoading || isLoadingWordInfo || !formData.english.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isLoadingWordInfo ? "Đang tạo..." : "🔊 Tạo phiên âm"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || isLoadingWordInfo || isLoadingTranslation}
        >
          {isLoading ? "Đang thêm..." : "Thêm từ vựng"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h3>Hướng dẫn:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Nhập từ tiếng Anh</li>
          <li>
            Nhập nghĩa tiếng Việt hoặc click "🌐 Tạo nghĩa" để tự động dịch
          </li>
          <li>Chọn loại từ phù hợp</li>
          <li>
            Nhập phiên âm manual hoặc click "🔊 Tạo phiên âm" để tự động tạo
          </li>
          <li>Nhấn "Thêm từ vựng" để lưu</li>
          <li>Từ vựng đã thêm sẽ xuất hiện trong phần ôn tập và danh sách</li>
        </ul>
      </div>
    </div>
  );
};

export default AddVocabulary;
