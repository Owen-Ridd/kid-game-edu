# Kid Game Edu 🎈

Nền tảng trò chơi tương tác giáo dục dành cho trẻ em lứa tuổi mầm non (3–6 tuổi). Ứng dụng phát triển theo phương pháp giáo dục trực quan qua trò chơi **"Kéo - Thả" (Drag & Drop)**, được tối ưu hóa cho màn hình cảm ứng máy tính bảng (iPad/Tablet) và máy tính.

---

## 🚀 Khởi chạy Nhanh

### 1. Khởi động Backend (Spring Boot 3 + Java 17)
```bash
cd backend
mvn spring-boot:run
```
*API Backend chạy tại: `http://localhost:8080` (Health check: `/api/health`).*

### 2. Khởi động Frontend (Angular 18 + Tailwind CSS)
```bash
cd frontend
npm install
npm start
```
*Truy cập ứng dụng tại: `http://localhost:4200`.*
- **Trẻ mầm non & Giáo viên:** Nhập mã PIN demo: `123456` để trải nghiệm trò chơi phân loại quả.
- **Bàn làm việc Quản trị (Teacher Desk):** Bấm "Teacher login" ở góc phải để quản lý bài tập và theo dõi số lỗi.

---

## 📚 Thư viện Tài liệu Dự án (`docs/`)

Toàn bộ tài liệu chi tiết của dự án được lưu trữ tập trung tại thư mục [`docs/`](./docs/):

- 📖 [**Tổng quan & Hướng dẫn Cài đặt (`docs/README.md`)**](./docs/README.md): Hướng dẫn chi tiết, biến môi trường và đóng gói Docker.
- 🎯 [**Đặc tả Yêu cầu Sản phẩm (`docs/PRODUCT_REQUIREMENTS.md`)**](./docs/PRODUCT_REQUIREMENTS.md): Chân dung người dùng, câu chuyện người dùng (User Stories) và tiêu chuẩn UI/UX trẻ em.
- 🏗️ [**Kiến trúc Hệ thống (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Sơ đồ luồng dữ liệu, C4 Context, danh sách toàn bộ REST API và các quyết định kiến trúc (ADR).
- 🗄️ [**Thiết kế Cơ sở Dữ liệu (`docs/DATABASE.md`)**](./docs/DATABASE.md): Thiết kế Schema MongoDB, sơ đồ ERD, định nghĩa Indexes và JSON document mẫu.
- 📋 [**Kế hoạch Triển khai (`docs/IMPLEMENTATION_PLAN.md`)**](./docs/IMPLEMENTATION_PLAN.md): Lộ trình chi tiết từng Phase, checklist trạng thái hoàn thành và ma trận kiểm thử.
- 🤖 [**Hướng dẫn cho AI & Copilot (`docs/copilot-instructions.md`)**](./docs/copilot-instructions.md): Quy chuẩn lập trình, mẫu code Java/Angular và các quy tắc bất biến.
- ⚙️ [**Mẫu Biến Môi trường (`docs/env.example`)**](./docs/env.example): File mẫu cấu hình biến môi trường an toàn.

---

## 🛠️ Công nghệ Chính

- **Frontend:** Angular 18 (Standalone Components, Signals), Angular CDK Drag & Drop, Tailwind CSS.
- **Backend:** Spring Boot 3.4.4, Java 17, Spring Security, JJWT 0.12.6, Spring Data MongoDB.
- **Database & Media:** MongoDB, Cloudinary CDN.
- **DevOps:** Docker (`eclipse-temurin:17-jre`).
