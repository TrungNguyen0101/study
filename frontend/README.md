# Frontend - Vocabulary Learning App

React frontend cho ứng dụng học từ vựng tiếng Anh.

## 🚀 Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Chạy development server:

```bash
npm start
```

Ứng dụng sẽ mở tại: http://localhost:3000

## 📱 Tính năng

### 1. Thêm từ vựng

- Form đơn giản với 2 input
- Validation đầu vào
- Thông báo thành công/lỗi

### 2. Game ôn tập

- Lưới 4x4 cards (8 từ vựng)
- Ghép cặp từ tiếng Anh với nghĩa
- Phát âm khi ghép đúng
- Hiệu ứng visual cho đúng/sai
- Thống kê real-time

## 🎨 Component Structure

```
src/
├── components/
│   ├── AddVocabulary.js    # Trang thêm từ vựng
│   └── ReviewGame.js       # Game ôn tập
├── services/
│   └── api.js             # API calls
├── App.js                 # Main app với navigation
├── index.js              # Entry point
└── index.css             # Global styles
```

## 🔧 API Integration

Frontend kết nối với backend qua:

- Base URL: `http://localhost:5000/api`
- Sử dụng Axios cho HTTP requests
- Proxy config trong package.json

## 🎵 Text-to-Speech

Sử dụng Web Speech API:

```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "en-US";
speechSynthesis.speak(utterance);
```

## 📱 Responsive Design

- Mobile-first approach
- CSS Grid cho game layout
- Flexible navigation

## 🚀 Build & Deploy

```bash
# Development
npm start

# Production build
npm run build

# Test
npm test
```
