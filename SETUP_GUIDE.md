# 🚀 Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

## 📋 Yêu Cầu Hệ Thống

- Node.js (v14 trở lên)
- MongoDB Atlas account (hoặc MongoDB local)
- Git

## 🛠️ Cài Đặt Backend

### 1. Di chuyển đến thư mục backend

```bash
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy server

```bash
# Development mode với nodemon
npm run dev

# Hoặc production mode
npm start
```

Backend sẽ chạy tại: **http://localhost:5000**

## 🎨 Cài Đặt Frontend

### 1. Mở terminal mới và di chuyển đến thư mục frontend

```bash
cd frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy ứng dụng React

```bash
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

## ✨ Tính Năng Mới Đã Thêm

### 🏷️ **Loại Từ (Word Types)**

- Tự động phát hiện loại từ khi nhập từ tiếng Anh
- Hỗ trợ các loại: Danh từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Thán từ, Đại từ
- Có thể chỉnh sửa manual nếu cần

### 🔊 **Phiên Âm Tự Động**

- Tự động tạo phiên âm IPA khi nhập từ tiếng Anh
- Sử dụng Free Dictionary API để lấy phiên âm chính xác
- Fallback sang phiên âm đơn giản nếu API không có dữ liệu
- Có thể chỉnh sửa phiên âm manually

### 📋 **Trang Danh Sách Từ Vựng**

- **Tìm kiếm**: Tìm theo từ tiếng Anh hoặc nghĩa tiếng Việt
- **Lọc theo loại từ**: Dropdown để lọc theo từng loại từ
- **Phân trang**: Hiển thị 20 từ mỗi trang
- **Chỉnh sửa inline**: Click "Sửa" để edit trực tiếp
- **Xóa từ vựng**: Xác nhận trước khi xóa
- **Phát âm**: Click 🔊 để nghe phát âm
- **Thống kê**: Hiển thị số lần ôn tập và lần ôn cuối

## 🎯 **Cách Sử Dụng Tính Năng Mới**

### Thêm Từ Vựng:

1. Nhập từ tiếng Anh → Hệ thống tự động tạo phiên âm và phát hiện loại từ
2. Nhập nghĩa tiếng Việt
3. Kiểm tra/chỉnh sửa loại từ và phiên âm nếu cần
4. Click "Thêm từ vựng"

### Quản Lý Danh Sách:

1. Chuyển đến tab "📋 Danh sách"
2. Dùng ô tìm kiếm để tìm từ vựng
3. Dùng dropdown để lọc theo loại từ
4. Click "Sửa" để chỉnh sửa từ vựng
5. Click "Xóa" để xóa từ vựng
6. Click 🔊 để nghe phát âm

## 🔧 **API Endpoints Mới**

### Lấy thông tin từ vựng tự động:

```
GET /api/vocabulary/word-info/:word
```

### Lấy danh sách với tìm kiếm:

```
GET /api/vocabulary/all?search=hello&wordType=noun&page=1&limit=20
```

### Cập nhật từ vựng:

```
PUT /api/vocabulary/:id
```

### Lấy một từ vựng:

```
GET /api/vocabulary/:id
```

## 🗄️ **Database Schema Mới**

```javascript
{
  english: String,        // Từ tiếng Anh
  vietnamese: String,     // Nghĩa tiếng Việt
  wordType: String,       // Loại từ (noun, verb, adjective, ...)
  pronunciation: String,  // Phiên âm IPA
  lastReviewed: Date,     // Lần ôn cuối
  reviewCount: Number,    // Số lần ôn
  createdAt: Date        // Ngày tạo
}
```

## 🌐 **API Dictionary Service**

Ứng dụng sử dụng **Free Dictionary API** để:

- Lấy phiên âm chính xác
- Phát hiện loại từ tự động
- Cung cấp định nghĩa bổ sung

API URL: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

## 🎯 **Tips Sử Dụng**

1. **Phiên âm tự động**: Hệ thống sẽ tự động tạo phiên âm khi bạn nhập từ tiếng Anh và dừng gõ trong 0.5 giây

2. **Loại từ thông minh**: API sẽ tự động detect loại từ phổ biến nhất của từ đó

3. **Tìm kiếm linh hoạt**: Có thể tìm theo từ tiếng Anh hoặc nghĩa tiếng Việt

4. **Phân trang thông minh**: Tự động nhớ trang hiện tại khi filter

5. **Backup phiên âm**: Nếu API không có dữ liệu, hệ thống sẽ tạo phiên âm đơn giản

## 🚨 **Lưu Ý**

- API Dictionary cần kết nối internet để hoạt động
- Nếu không có internet, phiên âm sẽ được tạo đơn giản
- Database schema đã thay đổi, có thể cần migration cho dữ liệu cũ
- Tính năng tự động chỉ hoạt động với từ tiếng Anh có trong dictionary

## 📞 **Troubleshooting**

### Backend không start:

- Kiểm tra MongoDB connection string
- Chạy `npm install` để cài đặt dependencies mới

### Frontend không load:

- Đảm bảo backend đã chạy trước
- Kiểm tra proxy config trong package.json

### API Dictionary không hoạt động:

- Kiểm tra kết nối internet
- Hệ thống sẽ fallback sang phiên âm đơn giản

Chúc bạn sử dụng ứng dụng vui vẻ! 🎉
