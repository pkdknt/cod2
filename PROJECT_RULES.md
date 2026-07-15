# QUY TẮC PHÁT TRIỂN DỰ ÁN (PROJECT RULES)

Tài liệu này xác định các tiêu chuẩn kỹ thuật bắt buộc phải tuân theo khi đóng góp mã nguồn cho dự án Nhơn Tâm Management.

---

## 1. Tiêu chuẩn TypeScript & Cú pháp
- **Strict Mode**: Luôn khai báo tường minh kiểu dữ liệu cho tham số đầu vào của hàm. Tránh lạm dụng kiểu `any` trừ trường hợp bắt buộc (như nạp thư viện ngoài động).
- **Interfaces vs Types**: Sử dụng `interface` cho cấu trúc dữ liệu Model, Service, và Props của Component; sử dụng `type` cho các kiểu kết hợp (union) hoặc bí danh.
- **Nullish Coalescing**: Ưu tiên sử dụng toán tử `??` thay vì `||` khi xử lý giá trị mặc định của biến dạng chuỗi hoặc số để tránh bỏ qua giá trị `0` hoặc chuỗi rỗng `""`.

---

## 2. Quy ước Thiết kế UI (CSS & TailwindCSS v4 - Modern Minimalist)
- **Thiết kế Responsive**: Mọi trang phải hoạt động tốt trên cả màn hình di động (dọc/ngang) và desktop. Sử dụng lớp `md:` hoặc `lg:` để ẩn/hiện sidebar và chuyển đổi bố cục bảng sang dạng lưới thu gọn.
- **Phông chữ thống nhất**: Sử dụng font Google (`Plus Jakarta Sans` hoặc `Inter`) với subset `vietnamese`. Thiết lập font-sans thống nhất qua cấu hình `@theme` của Tailwind v4. Không sử dụng font Arial hoặc Sans-serif hệ thống mặc định.
- **Hài hòa màu sắc & Hạn chế Gradient**: Không lạm dụng màu gradient sặc sỡ hoặc hiệu ứng phát sáng. Sử dụng bảng màu nền sáng tinh tế (`bg-slate-50`, `bg-white`) kết hợp với các đường viền mỏng (`border-slate-100`, `border-slate-200/60`). Màu xanh mòng két (`teal-600`) là màu nhấn chính cho y tế, không pha trộn nhiều tông màu nóng lạnh khác nhau trên cùng một trang.
- **Độ tương phản & Khả dụng (Accessibility)**: Tất cả chữ và nút bấm phải đạt tỷ lệ tương phản WCAG AA (tối thiểu 4.5:1 đối với văn bản thường và 3:1 đối với văn bản lớn). Nút bấm phải có chữ rõ ràng, không bị xuống dòng ở desktop.
- **Tương tác vật lý (Tactile Feedback)**: Các nút bấm hoặc thẻ có thể click phải tích hợp hiệu ứng nhấn thực tế: `:active` sử dụng `scale-[0.98]` hoặc `-translate-y-[1px]`.
- **Độ bo góc & Bóng đổ**: Đồng bộ tỷ lệ bo góc (ví dụ: `rounded-xl` cho thẻ nhỏ, `rounded-3xl` cho panel chính). Tránh dùng bóng đổ đen thô trên nền sáng; hãy sử dụng bóng đổ nhạt được tint nhẹ theo màu nền (ví dụ: `shadow-slate-200/50`).
- **Tailwind Class Order**: Bố trí các class theo thứ tự: Bố cục (`flex`, `grid`, `block`) → Kích thước (`w-`, `h-`) → Khoảng cách (`p-`, `m-`) → Trang trí (`bg-`, `border-`, `rounded-`) → Trạng thái (`hover:`, `focus:`).

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
