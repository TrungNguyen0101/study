# Hướng dẫn sửa lỗi API

## 🔧 Sửa lỗi JWT_SECRET

Lỗi `secretOrPrivateKey must have a value` xảy ra vì chưa có JWT_SECRET trong file `.env`.

### Cách 1: Tạo file .env manually

1. **Tại thư mục `backend/`, tạo file `.env`** (không có extension)

2. **Copy nội dung từ `env.example` và paste vào `.env`**

3. **Thay dòng:**

```
JWT_SECRET=your_jwt_secret_key_here_should_be_very_long_and_random
```

**Thành:**

```
JWT_SECRET=vocabulary_learning_app_super_secret_key_2024_very_long_and_secure_random_string
```

4. **Cập nhật MONGODB_URI** với connection string thực của bạn

### Cách 2: Sử dụng command line

```bash
# Trong thư mục backend/
copy env.example .env

# Sau đó edit file .env và thay JWT_SECRET
```

## 🔧 Sửa lỗi API Frontend

Tôi đã sửa lỗi trong `api.js` - bây giờ default export là `vocabularyAPI` thay vì `api`.

### Kiểm tra lại:

1. **File `frontend/src/services/api.js` line 93 phải là:**

```javascript
export default vocabularyAPI;
```

2. **File `frontend/src/contexts/AuthContext.js` line 2 phải là:**

```javascript
import { api } from "../services/api";
```

## 🚀 Restart servers

Sau khi sửa:

1. **Stop backend server** (Ctrl+C)
2. **Start lại backend:**

```bash
cd backend
npm run dev
```

3. **Restart frontend** (Ctrl+C rồi `npm start`)

## ✅ Test

1. Mở `http://localhost:3000/register123`
2. Đăng ký tài khoản mới
3. Kiểm tra xem có lỗi không

Nếu vẫn lỗi, check:

- File `.env` có tồn tại trong `backend/` không
- JWT_SECRET có giá trị không
- Server backend có restart không
