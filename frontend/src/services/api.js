import axios from "axios";

// const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "https://nguyenpt1.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const vocabularyAPI = {
  // Thêm từ vựng mới
  addVocabulary: (data) => api.post("/vocabulary/add", data),

  // Lấy tất cả từ vựng với tìm kiếm và phân trang
  getAllVocabularies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/vocabulary/all?${queryString}`);
  },

  // Lấy thông tin từ vựng tự động (phiên âm, loại từ)
  getWordInfo: (word) => api.get(`/vocabulary/word-info/${word}`),

  // Lấy bản dịch tiếng Việt tự động
  getTranslation: (word) => api.get(`/vocabulary/translate/${word}`),

  // Lấy một từ vựng theo ID
  getVocabulary: (id) => api.get(`/vocabulary/${id}`),

  // Cập nhật từ vựng
  updateVocabulary: (id, data) => api.put(`/vocabulary/${id}`, data),

  // Lấy từ vựng để ôn tập
  getReviewVocabularies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/vocabulary/review?${queryString}`);
  },

  // Cập nhật trạng thái memorized
  updateMemorized: (id, memorized) =>
    api.put(`/vocabulary/memorized/${id}`, { memorized }),

  // Cập nhật trạng thái studied
  updateStudied: (id, studied) =>
    api.put(`/vocabulary/studied/${id}`, { studied }),

  // Cập nhật trạng thái ôn tập
  updateReview: (id) => api.put(`/vocabulary/review/${id}`),

  // Xóa từ vựng
  deleteVocabulary: (id) => api.delete(`/vocabulary/${id}`),
};

export default api;
