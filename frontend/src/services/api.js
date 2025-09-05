import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
// const API_BASE_URL = "https://nguyenpt1.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để tự động thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token không hợp lệ hoặc hết hạn
      localStorage.removeItem("token");
      // Redirect về login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Tạo vocabularyAPI object riêng với tất cả methods
const vocabularyAPI = {
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

  // Lấy câu hỏi multiple choice
  getMultipleChoiceQuestion: () => api.get("/vocabulary/multiple-choice"),

  // Lấy câu hỏi điền từ
  getFillBlankQuestion: () => api.get("/vocabulary/fill-blank"),

  // Xóa từ vựng
  deleteVocabulary: (id) => api.delete(`/vocabulary/${id}`),

  // Migration API - Cập nhật vocabulary cũ cho user hiện tại
  migrateVocabulariesToUser: () => api.post("/vocabulary/migrate-to-user"),
};

// Export cả named và default để đảm bảo tương thích
export { vocabularyAPI, api };
export default vocabularyAPI;
