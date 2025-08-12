# 🚀 Hướng dẫn cài đặt và chạy ứng dụng

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- MongoDB (hoặc MongoDB Atlas)
- Git

## 🛠️ Cài đặt

### 1. Backend Setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (tuỳ chọn)
# PORT=5000
# MONGODB_URI=mongodb+srv://trungnguyen010102hl:nguyenvip12@study.kiq8c3g.mongodb.net/

# Chạy backend với auto-reload (KHUYẾN NGHỊ)
npm run dev

# Hoặc dùng script có sẵn:
# Windows: start-dev.bat
# Linux/Mac: ./start-dev.sh
```

**💡 Lưu ý:** Dùng `npm run dev` thay vì `npm start` để có auto-reload!
```

### 2. Frontend Setup

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy frontend
npm start
```

## 🔧 Khắc phục sự cố

### Lỗi "Cannot find module 'axios'"

```bash
cd backend
npm install axios
```

### Lỗi kết nối MongoDB

- Kiểm tra connection string trong `backend/config/database.js`
- Đảm bảo MongoDB Atlas cluster đang chạy

### Lỗi CORS

- Backend phải chạy trên port 5000
- Frontend phải chạy trên port 3000

### Lỗi 404 API

- Đảm bảo backend đã chạy trước khi start frontend
- Kiểm tra `frontend/src/services/api.js` có baseURL đúng

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Tính năng

✅ Thêm từ vựng (với auto-dịch và phiên âm)
✅ Flashcard học từng từ
✅ Game ôn tập ghép cặp
✅ Quản lý danh sách từ vựng
✅ Đánh dấu từ đã nhớ
✅ Phân trang và tìm kiếm
✅ Responsive mobile

## 🐛 Báo lỗi

Nếu gặp vấn đề, hãy:

1. Kiểm tra console browser (F12)
2. Kiểm tra terminal backend có error
3. Restart cả backend và frontend
