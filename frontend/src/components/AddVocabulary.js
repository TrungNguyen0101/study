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

  // Lấy tất cả thông tin tự động (nghĩa, loại từ, phiên âm)
  const fetchAllInfo = useCallback(async () => {
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
      // Lấy thông tin từ vựng (phiên âm, loại từ)
      const wordInfoResponse = await vocabularyAPI.getWordInfo(
        formData.english.trim()
      );
      console.log("🚀 ~ AddVocabulary ~ wordInfoResponse:", wordInfoResponse);

      // Lấy bản dịch tiếng Việt
      const translationResponse = await vocabularyAPI.getTranslation(
        formData.english.trim()
      );
      console.log(
        "🚀 ~ AddVocabulary ~ translationResponse:",
        translationResponse
      );

      const { pronunciation, wordType } = wordInfoResponse.data;
      const { vietnamese, success } = translationResponse.data;

      // Cập nhật tất cả thông tin
      setFormData((prev) => ({
        ...prev,
        pronunciation: pronunciation || prev.pronunciation,
        wordType: wordType || prev.wordType,
        vietnamese: vietnamese || prev.vietnamese,
      }));

      // Thông báo kết quả
      let successCount = 0;
      if (pronunciation) successCount++;
      if (wordType) successCount++;
      if (success && vietnamese) successCount++;

      if (successCount > 0) {
        setMessage(`Đã tạo thành công ${successCount} thông tin!`);
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      } else {
        setMessage("Không thể tạo thông tin tự động. Vui lòng nhập thủ công.");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }
    } catch (error) {
      console.log("Could not fetch all info:", error);
      const errorMessage =
        "Không thể tạo thông tin tự động. Vui lòng thử lại sau.";
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
          <input
            type="text"
            id="vietnamese"
            name="vietnamese"
            value={formData.vietnamese}
            onChange={handleChange}
            placeholder="Nhập nghĩa tiếng Việt..."
            disabled={isLoading}
          />
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
          <input
            type="text"
            id="pronunciation"
            name="pronunciation"
            value={formData.pronunciation}
            onChange={handleChange}
            placeholder="Nhập phiên âm..."
            disabled={isLoading}
          />
        </div>

        {/* Button tự động lấy tất cả thông tin */}
        <div
          className="form-group"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <button
            type="button"
            onClick={fetchAllInfo}
            disabled={
              isLoading || isLoadingWordInfo || !formData.english.trim()
            }
            className="btn"
            style={{
              padding: "15px 30px",
              backgroundColor: isLoadingWordInfo ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor:
                isLoading || isLoadingWordInfo || !formData.english.trim()
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto",
            }}
          >
            {isLoadingWordInfo ? (
              <>
                <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                Đang tạo thông tin...
              </>
            ) : (
              <>🚀 Tự động lấy tất cả thông tin</>
            )}
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || isLoadingWordInfo}
        >
          {isLoading ? "Đang thêm..." : "Thêm từ vựng"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h3>Hướng dẫn:</h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Nhập từ tiếng Anh</li>
          <li>
            Nhập nghĩa tiếng Việt, chọn loại từ, nhập phiên âm (hoặc để trống)
          </li>
          <li>
            Click "🚀 Tự động lấy tất cả thông tin" để tự động tạo nghĩa, loại
            từ và phiên âm
          </li>
          <li>Nhấn "Thêm từ vựng" để lưu</li>
          <li>Từ vựng đã thêm sẽ xuất hiện trong phần ôn tập và danh sách</li>
        </ul>
      </div>
    </div>
  );
};

export default AddVocabulary;
