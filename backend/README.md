# Backend - Vocabulary Learning API

## 🚀 Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Chạy server:

```bash
npm start
# hoặc cho development với nodemon:
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## 📋 API Endpoints

### Vocabulary Management

#### 1. Thêm từ vựng mới

```
POST /api/vocabulary/add
```

**Body:**

```json
{
  "english": "hello",
  "vietnamese": "xin chào"
}
```

#### 2. Lấy tất cả từ vựng

```
GET /api/vocabulary/all
```

#### 3. Lấy từ vựng để ôn tập

```
GET /api/vocabulary/review?limit=8
```

- Ưu tiên từ chưa ôn tập (lastReviewed = null)
- Sau đó đến từ ôn lâu nhất

#### 4. Cập nhật trạng thái ôn tập

```
PUT /api/vocabulary/review/:id
```

#### 5. Xóa từ vựng

```
DELETE /api/vocabulary/:id
```

## 🗄️ Database Schema

### Vocabulary Model

```javascript
{
  english: String (required),     // Từ tiếng Anh
  vietnamese: String (required),  // Nghĩa tiếng Việt
  lastReviewed: Date,            // Lần ôn cuối (null = chưa ôn)
  reviewCount: Number,           // Số lần đã ôn (default: 0)
  createdAt: Date               // Ngày tạo (auto)
}
```

## 🔧 Cấu hình

### MongoDB Connection

- URI kết nối được cấu hình trong `config/database.js`
- Database name: `vocabulary_app`

### Environment Variables

Tạo file `.env` (optional):

```
MONGODB_URI=mongodb+srv://...
PORT=5000
```

## 📝 Scripts

- `npm start`: Chạy production server
- `npm run dev`: Chạy development server với nodemon (KHUYẾN NGHỊ)
- `npm run watch`: Chạy development server với auto-reload nâng cao

## ⚡ Auto-reload Features:
- **Tự động restart** khi sửa code trong `routes/`, `models/`, `services/`, `config/`
- **Watch tất cả file .js và .json**
- **Delay 1 giây** để tránh restart quá nhiều
- **Verbose logging** để dễ debug
