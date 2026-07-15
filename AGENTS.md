<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NHƠN TÂM MANAGEMENT - AGENT GUIDE & ARCHITECTURE

Chào mừng bạn đến với dự án quản trị Phòng khám Đa khoa Nhơn Tâm. Tài liệu này cung cấp cái nhìn tổng quan về hệ thống và các quy tắc để các AI Agent khác tiếp cận và mở rộng code một cách đồng nhất.

---

## 1. Giới thiệu dự án
Hệ thống quản lý dữ liệu bệnh nhân BHYT, CSKH Tiêm chủng, CSKH Chuyển tuyến, Quản lý Kho dược/Vật tư và kết xuất hồ sơ theo tiêu chuẩn Bộ Y tế.
- **Stack công nghệ**: Next.js 16 (App Router), React 19, MongoDB Atlas (Mongoose), TailwindCSS v4, SheetJS (xlsx-js-style).

---

## 2. Cấu trúc thư mục dự án
- [`src/app/`](file:///e:/cod2/src/app): Quản lý các Route và API.
  - [`(dashboard)/`](file:///e:/cod2/src/app/(dashboard)): Các trang giao diện chức năng chính (BHYT, CSKH, Kho, Bệnh án...).
  - [`api/`](file:///e:/cod2/src/app/api): Các endpoints REST API giao tiếp với MongoDB Atlas.
- [`src/components/`](file:///e:/cod2/src/components): Chứa các UI Components tái sử dụng (Sidebar, Modals, Tables, Forms).
- [`src/models/`](file:///e:/cod2/src/models): Định nghĩa Mongoose Schemas & TypeScript Interfaces cho Database.
- [`src/services/`](file:///e:/cod2/src/services): Lớp nghiệp vụ giao tiếp giữa Client và Server API.
  - Chứa thư mục [`interfaces/`](file:///e:/cod2/src/services/interfaces) định nghĩa contracts.
- [`src/lib/`](file:///e:/cod2/src/lib): Cấu hình MongoDB connection (`mongodb.ts`) và các helpers (`utils.ts`, `apiUtils.ts`).

---

## 3. Quy tắc Thiết kế (SOLID & OOP)
Hệ thống tuân thủ nghiêm ngặt các nguyên lý SOLID:
1. **Single Responsibility Principle (SRP)**: Mỗi class/service chỉ giải quyết một cụm nghiệp vụ. (Ví dụ: `BhytService` chỉ lo CRUD BHYT, `TransferReport` chỉ phụ trách tính toán thống kê chuyển viện).
2. **Interface Segregation Principle (ISP)**: Các service bắt buộc implement các interface nghiệp vụ nhỏ trong [`IBaseService.ts`](file:///e:/cod2/src/services/interfaces/IBaseService.ts) như `ICrudService`, `IBulkOperationService`, `IImportExportService` thay vì một interface tổng hợp quá lớn.
3. **Dependency Inversion Principle (DIP)**: Các controller và page component phụ thuộc vào interfaces/abstractions của Service thay vì phụ thuộc trực tiếp vào các logic kết nối REST thô.

---

## 4. Coding Conventions & Quy ước Đặt tên
- **Ngôn ngữ**: Đặt tên biến, hàm, file bằng **tiếng Anh** (camelCase cho biến/hàm, PascalCase cho Components/Classes). Text hiển thị trên UI bằng **tiếng Việt**.
- **Mongoose Models**: Đặt tên dạng số ít (ví dụ: `BhytCustomer`, `PatientTransfer`).
- **Autosave Pattern**: Bảng dữ liệu hỗ trợ chỉnh sửa trực tiếp (inline edit) phải lưu tự động sau 1.5 - 2 giây không gõ phím sử dụng mẫu debounce (`setTimeout` + `clearTimeout` được lưu trữ qua React `useRef`).
- **Excel Handling**: Mọi tác vụ đọc và ghi Excel đều sử dụng `xlsx-js-style` nạp động client-side (`import('xlsx-js-style')`) để giảm dung lượng file bundle ban đầu và ngăn lỗi SSR.

