# Vercel Deployment Guide

## Cấu hình cần thiết để deploy backend lên Vercel

### 1. Cài đặt Vercel CLI

```bash
npm install -g vercel
```

### 2. Đăng nhập vào Vercel

```bash
vercel login
```

### 3. Cấu hình Environment Variables

Trong Vercel Dashboard, thêm các biến môi trường sau:

- `MONGODB_URI`: URI kết nối MongoDB của bạn
- `NODE_ENV`: `production`
- `PORT`: `5000` (hoặc để trống để Vercel tự động)

### 4. Deploy

```bash
# Từ thư mục backend
vercel

# Hoặc deploy production
vercel --prod
```

### 5. Cấu trúc file đã tạo

- `vercel.json`: Cấu hình Vercel
- `env.example`: Ví dụ về biến môi trường
- `package.json`: Đã thêm script build

### 6. Lưu ý quan trọng

- Đảm bảo MongoDB Atlas cho phép kết nối từ Vercel IP
- Cập nhật CORS settings nếu cần
- Kiểm tra logs trong Vercel Dashboard nếu có lỗi

### 7. Test API sau khi deploy

```bash
# Health check
curl https://your-app.vercel.app/

# API endpoint
curl https://your-app.vercel.app/api/vocabulary
```

### 8. Troubleshooting

- Nếu có lỗi database, kiểm tra MONGODB_URI
- Nếu có lỗi CORS, kiểm tra frontend URL trong CORS settings
- Xem logs trong Vercel Dashboard
