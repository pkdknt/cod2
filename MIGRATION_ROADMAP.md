# LỘ TRÌNH CHUYỂN ĐỔI HỆ THỐNG PHÒNG KHÁM NHƠN TÂM SANG NEXT.JS

Danh sách dưới đây liệt kê lộ trình chuyển đổi chi tiết tất cả các file HTML standalone trong thư mục `htmltemp` sang dự án Next.js chính tại `e:\cod2`.

Khi hoàn thành xong mỗi trang/phân hệ, trạng thái sẽ được cập nhật sang `[x]` và chuyển tiếp sang trang tiếp theo.

---

## 📋 Danh sách Phân hệ và Trạng thái Chuyển đổi

### 1. Phân hệ Nền tảng & Quản lý BHYT
- **Route**: `/` (Trang chủ) và `/bhyt` (Quản lý khách BHYT)
- **File gốc**: `QUAN_LY_BHYT 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Chức năng đã có**: Thống kê động hạn thẻ, bảng grid nhập liệu trực tiếp tự lưu sau 2 giây, tìm kiếm nhanh, import Excel tự động map cột bằng SheetJS, export Excel, lọc và thao tác nhóm.

### 2. Phân hệ CSKH Chuyển viện
- **Route**: `/chuyen-vien`
- **File gốc**: `CSKH_Chuyen_Vien_290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: CRUD bệnh nhân chuyển tuyến, lọc danh sách theo bác sĩ/bệnh viện/ngày tháng, ghi nhận kết quả gọi CSKH follow-up và xuất báo cáo.

### 3. Phân hệ Báo cáo Số ca khám
- **Route**: `/bao-cao-ca-kham`
- **File gốc**: `Bao_Cao_So_Ca_Kham 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Nhập số ca khám hàng ngày theo từng phòng ban, bảng Excel-style nhập liệu nhanh, so sánh lượng ca khám giữa các tháng/tuần/năm và hiển thị biểu đồ xu hướng.

### 4. Phân hệ Quản lý Kho (Gộp 3 Kho)
- **Route**: `/kho/vtyt` (Vật tư y tế), `/kho/ho-ly` (Kho hộ lý), `/kho/vpp` (Văn phòng phẩm)
- **File gốc**: `QuanLyKho_Vat_Tu_Y_Te 290626.html`, `QuanLyKho_Ho_Ly 290626.html`, `QuanLyKho_Van_Phong_Pham 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Thống kê danh mục hàng hóa, nhập/xuất kho theo ngày, lọc theo nhân viên nhận/khoa phòng sử dụng, tính tồn cuối ngày và kết xuất báo cáo tồn kho in ấn A4.

### 5. Phân hệ Lịch tiêm Vắc xin
- **Route**: `/tiem-chung`
- **File gốc**: `Lich_Tiem_VACXIN 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Quản lý danh mục vắc xin và các phác đồ tiêm ngừa, tính toán lịch tiêm mũi tiếp theo dựa trên ngày sinh và ngày tiêm thực tế của khách, hỗ trợ PWA hiển thị trên điện thoại.

### 6. Phân hệ KSK Lái xe TT36
- **Route**: `/ksk-lai-xe`
- **File gốc**: `KSK_Lai_Xe_TT36 290626.html` + `fix_ksk.js`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Quản lý hồ sơ khám sức khỏe lái xe, điền thông tin nhanh bằng file Excel, kết xuất bản in A3 ngang hai mặt đúng tiêu chuẩn của Bộ Y tế (TT36).

### 7. Phân hệ Thẻ xanh Chứng nhận Sức khỏe
- **Route**: `/the-xanh`
- **File gốc**: `The_Xanh_PKDK Nhon Tam 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Đọc danh sách kiểm tra sức khỏe từ Excel, mail merge in thẻ chứng nhận sức khỏe khổ A4 (chia 4 thẻ lớn 14.6x9.9cm) nhanh chóng.

### 8. Phân hệ Bệnh án & Bìa bệnh án (RHM / YHCT)
- **Route**: `/benh-an`
- **File gốc**: 
  - `Benh_an_RHM_A3_2026 290626.html` (Bệnh án RHM)
  - `Bia_benh_an_Ngoai_Tru_A3 290626.html` (Bìa Ngoại trú)
  - `Bia_benh_an_RHM_A3 290626.html` (Bìa RHM)
  - `Bia_benh_an_YHCT_A3 290626.html` (Bìa YHCT)
  - Các file js hỗ trợ: `fix_bia.js`, `fix_bia_rhm.js`, `fix_bia_yhct.js`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Form nhập liệu bệnh án răng hàm mặt chi tiết, các mẫu bìa bệnh án in khổ A3 xếp đôi chuẩn quy định.

### 9. Phân hệ Số ca BHYT Mua/Gia hạn
- **Route**: `/bhyt/so-ca` (hoặc tích hợp trực tiếp trong `/bhyt`)
- **File gốc**: `QuanLy_SO_CA_BHYT_Mua_GiaHan 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Thống kê số lượng ca đăng ký mới hoặc gia hạn BHYT theo chu kỳ.

### 10. Phân hệ Tin nhắn nhắc (BHYT & Tiêm)
- **Route**: `/tin-nhan`
- **File gốc**: `Tin_Nhan_Nhac_Gia_Han_BHYT 290626.html`, `Tin_Nhan_Nhac_Lich_TIEMNGUA 290626.html`
- **Trạng thái**: `[x] Đã hoàn thành`
- **Nghiệp vụ**: Quản lý các mẫu tin nhắn nhắc gia hạn thẻ BHYT và nhắc lịch tiêm ngừa vắc xin, lọc danh sách khách đến hạn gửi để sao chép nhanh nội dung gửi qua Zalo/SMS.
