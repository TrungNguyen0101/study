# 📦 Hướng dẫn Migration Data Cũ

## 🎯 Mục đích

API này giúp cập nhật tất cả vocabulary cũ (không có user) và gán cho user hiện tại đang đăng nhập.

## 🚀 Cách sử dụng

### 1. Truy cập ứng dụng

- Đăng nhập vào tài khoản của bạn
- Vào trang chính của ứng dụng

### 2. Thực hiện Migration

- Tìm nút **"📦 Migration Data"** ở góc phải navigation (gần username)
- Click nút này
- Xác nhận trong popup
- Chờ quá trình migration hoàn tất

### 3. Kết quả

- **Thành công**: Hiển thị số lượng vocabulary đã migration
- **Không có data**: Thông báo "Không có vocabulary nào cần migration"
- **Lỗi**: Hiển thị thông báo lỗi chi tiết

## 🔧 Chi tiết kỹ thuật

### Backend API:

- **Endpoint**: `POST /api/vocabulary/migrate-to-user`
- **Authentication**: Yêu cầu JWT token
- **Logic**:
  - Tìm tất cả vocabulary với `user = null` hoặc không có field `user`
  - Cập nhật field `user` với ID của user hiện tại

### Frontend:

- **Component**: `MigrationButton.js` trong navigation
- **Auto-hide**: Nút sẽ tự ẩn sau khi migration thành công
- **Confirmation**: Có popup xác nhận trước khi thực hiện
- **Loading state**: Hiển thị trạng thái đang xử lý

## ⚠️ Lưu ý quan trọng

1. **Backup dữ liệu** trước khi migration (khuyến nghị)
2. **Một lần sử dụng**: Sau khi migration thành công, nút sẽ tự ẩn
3. **Không thể undo**: Quá trình migration không thể hoàn tác
4. **Only current user**: Chỉ gán data cho user hiện tại đang đăng nhập

## 🧪 Cách test

1. **Tạo vocabulary test** (nếu cần):

   ```javascript
   // Trong MongoDB hoặc qua API cũ
   db.vocabularies.insertOne({
     english: "test",
     vietnamese: "thử nghiệm",
     // Không có field user
   });
   ```

2. **Đăng nhập** và thực hiện migration

3. **Kiểm tra kết quả**:
   - Vocabulary test sẽ xuất hiện trong danh sách của user
   - Check database: `user` field đã được thêm

## 🗑️ Cleanup sau Migration

Sau khi migration thành công, bạn có thể:

- Xóa component `MigrationButton.js`
- Xóa API endpoint `/migrate-to-user`
- Xóa CSS styles liên quan

## 📋 Checklist

- [ ] API migration hoạt động
- [ ] Button hiển thị trong navigation
- [ ] Confirmation popup hoạt động
- [ ] Loading state hiển thị đúng
- [ ] Success message hiển thị
- [ ] Data được migration chính xác
- [ ] Button tự ẩn sau migration thành công
