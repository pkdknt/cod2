# QUY TẮC PHÁT TRIỂN DỰ ÁN (PROJECT RULES)

Tài liệu này xác định các tiêu chuẩn kỹ thuật bắt buộc phải tuân theo khi đóng góp mã nguồn cho dự án Nhơn Tâm Management.

---

## 1. Tiêu chuẩn TypeScript & Cú pháp
- **Strict Mode**: Luôn khai báo tường minh kiểu dữ liệu cho tham số đầu vào của hàm. Tránh lạm dụng kiểu `any` trừ trường hợp bắt buộc (như nạp thư viện ngoài động).
- **Interfaces vs Types**: Sử dụng `interface` cho cấu trúc dữ liệu Model, Service, và Props của Component; sử dụng `type` cho các kiểu kết hợp (union) hoặc bí danh.
- **Nullish Coalescing**: Ưu tiên sử dụng toán tử `??` thay vì `||` khi xử lý giá trị mặc định của biến dạng chuỗi hoặc số để tránh bỏ qua giá trị `0` hoặc chuỗi rỗng `""`.

---

## 2. Quy ước Thiết kế UI (CSS & TailwindCSS v4)
- **Thiết kế Responsive**: Mọi trang phải hoạt động tốt trên cả màn hình di động (dọc/ngang) và desktop. Sử dụng lớp `md:` hoặc `lg:` để ẩn/hiện sidebar và chuyển đổi bố cục bảng sang dạng lưới thu gọn.
- **Tailwind Class Order**: Bố trí các class theo thứ tự: Bố cục (`flex`, `grid`, `block`) → Kích thước (`w-`, `h-`) → Khoảng cách (`p-`, `m-`) → Trang trí (`bg-`, `border-`, `rounded-`) → Trạng thái (`hover:`, `focus:`).
- **Hài hòa màu sắc**: Tránh dùng màu sắc chói thô. Sử dụng các nhóm màu dịu mát mắt của hệ thống: màu xanh mòng két (`teal`) và ngọc lục bảo (`emerald`) làm chủ đạo cho y tế, màu hổ phách (`amber`) cho cảnh báo nhẹ, và màu đỏ dịu (`red-600/bg-red-50`) cho cảnh báo nguy cấp.

---

## 3. Quy chuẩn REST API & Mongoose
- **Cấu trúc Response**: Phản hồi API luôn trả về dưới dạng JSON có trường trạng thái thành công và dữ liệu bao bọc tương ứng:
  ```json
  {
    "success": true,
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 100,
      "totalFiltered": 10
    }
  }
  ```
- **Error Status Codes**: Trả về `400` cho lỗi dữ liệu đầu vào thiếu/sai, `404` cho tài nguyên không tìm thấy, và `500` kèm thông tin mô tả chi tiết lỗi từ database.
- **Connection Cache**: API Route bắt buộc import và gọi hàm `connectToDatabase()` từ `@/lib/mongodb` để đảm bảo dùng chung kết nối MongoDB (Mongoose connection pooling), tránh tràn số lượng kết nối tối đa khi NextJS hot-reload.

---

## 4. Debounced Autosave (Tự động Lưu)
Khi người dùng sửa trực tiếp trên ô dữ liệu của spreadsheet grid:
1. Ghi nhận thay đổi tức thì lên React State nội bộ của Component để đảm bảo UI không bị giật/lag (Optimistic UI Update).
2. Tạo một timer chờ 1.5 đến 2 giây sử dụng `setTimeout`.
3. Nếu người dùng tiếp tục gõ/sửa trước khi hết thời gian, xóa timer cũ bằng `clearTimeout` và thiết lập timer mới.
4. Khi timer kích hoạt thành công, gọi Service API để đồng bộ xuống cơ sở dữ liệu ngầm.
