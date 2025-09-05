# Hướng dẫn Setup Authentication

## Đã triển khai các tính năng sau:

### Backend:

1. ✅ **Model User** (`backend/models/User.js`)

   - Tên đăng nhập và mật khẩu
   - Mã hóa mật khẩu với bcryptjs
   - Validation đầy đủ

2. ✅ **Routes Authentication** (`backend/routes/auth.js`)

   - POST `/api/auth/register` - Đăng ký
   - POST `/api/auth/login` - Đăng nhập
   - GET `/api/auth/me` - Lấy thông tin user hiện tại

3. ✅ **Middleware Authentication** (`backend/middleware/auth.js`)

   - Xác thực JWT token
   - Bảo vệ các routes

4. ✅ **Cập nhật Model Vocabulary**

   - Thêm trường `user` để liên kết với User
   - Tất cả từ vựng giờ thuộc về user cụ thể

5. ✅ **Cập nhật Routes Vocabulary**
   - Tất cả routes đều yêu cầu authentication
   - Chỉ hiển thị từ vựng của user hiện tại

### Frontend:

1. ✅ **AuthContext** (`frontend/src/contexts/AuthContext.js`)

   - Quản lý trạng thái đăng nhập
   - Login, Register, Logout functions
   - Auto-check token khi khởi tạo

2. ✅ **Components Authentication**

   - `Login.js` - Form đăng nhập
   - `Register.js` - Form đăng ký
   - `AuthPage.js` - Chuyển đổi giữa login/register

3. ✅ **React Router Setup**

   - Tích hợp React Router cho URL routing
   - Tách riêng `/login` và `/register` routes
   - ProtectedRoute component để bảo vệ main app
   - Auto-redirect sau login/logout

4. ✅ **Cập nhật App.js**

   - Router-based navigation thay vì conditional rendering
   - Separate LoginPage và RegisterPage components
   - MainApp component riêng cho nội dung chính

5. ✅ **API Interceptors**

   - Tự động thêm Bearer token vào headers
   - Xử lý lỗi 401 (unauthorized)

6. ✅ **CSS Styling**
   - Giao diện đẹp cho authentication
   - Responsive design
   - Loading states và error handling

## Cài đặt và chạy:

### 1. Backend Setup:

```bash
cd backend

# Cài đặt dependencies mới
npm install bcryptjs jsonwebtoken

# Tạo file .env (copy từ env.example)
cp env.example .env

# Cập nhật .env với:
# - MONGODB_URI: connection string của bạn
# - JWT_SECRET: một secret key dài và ngẫu nhiên

# Chạy server
npm run dev
```

### 2. Frontend Setup:

```bash
cd frontend

# Cài đặt React Router
npm install react-router-dom

# Chạy ứng dụng
npm start
```

## Cách sử dụng:

1. **Đăng ký tài khoản mới:**

   - Tên đăng nhập: 3-20 ký tự
   - Mật khẩu: ít nhất 6 ký tự

2. **Đăng nhập:**

   - Sử dụng tên đăng nhập và mật khẩu

3. **Sử dụng ứng dụng:**

   - Sau khi đăng nhập, bạn có thể sử dụng tất cả tính năng
   - Từ vựng chỉ thuộc về tài khoản của bạn
   - Token được lưu trong localStorage và tự động gia hạn

4. **Đăng xuất:**
   - Click nút "🚪 Đăng xuất" trên navigation

## Security Features:

- ✅ Mật khẩu được mã hóa với bcryptjs
- ✅ JWT token với thời hạn 7 ngày
- ✅ Middleware bảo vệ tất cả API endpoints
- ✅ Token tự động được thêm vào requests
- ✅ Auto-logout khi token hết hạn
- ✅ Input validation ở cả frontend và backend
- ✅ User isolation - mỗi user chỉ thấy data của mình

## API Endpoints:

### Authentication:

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user (cần token)

### Vocabulary (tất cả cần token):

- `POST /api/vocabulary/add` - Thêm từ vựng
- `GET /api/vocabulary/all` - Lấy danh sách từ vựng
- `GET /api/vocabulary/review` - Lấy từ vựng để ôn tập
- `GET /api/vocabulary/multiple-choice` - Câu hỏi trắc nghiệm
- `GET /api/vocabulary/fill-blank` - Câu hỏi điền từ
- `PUT /api/vocabulary/:id` - Cập nhật từ vựng
- `DELETE /api/vocabulary/:id` - Xóa từ vựng

## URL Routes:

- **`/login`** - Trang đăng nhập
- **`/register`** - Trang đăng ký
- **`/`** - Trang chính (yêu cầu đăng nhập)
- **Bất kỳ URL nào khác** - Redirect về trang chính nếu đã đăng nhập, ngược lại về `/login`

Tất cả đã sẵn sàng để sử dụng! 🎉
