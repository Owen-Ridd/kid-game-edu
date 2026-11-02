# Kid Game Edu

Nền tảng web game tương tác giáo dục dành cho trẻ em độ tuổi mầm non (3–6 tuổi). Ứng dụng tập trung vào trải nghiệm học tập thông qua thực hành (Play-based Learning) với thao tác trực quan chính là **"Kéo - Thả" (Drag & Drop)**, được tối ưu hóa cho màn hình cảm ứng (iPad/Tablet) và máy tính.

---

## 1. Tính năng Nổi bật

- **Trò chơi Kéo - Thả Zero-Latency:** Trẻ kéo thả các quả vào đúng chiếc rổ có màu sắc/nhãn tương ứng. Toàn bộ logic so khớp được tính toán tức thời tại trình duyệt (<50ms) giúp trải nghiệm mượt mà không độ trễ.
- **Phản hồi Tức thời & Sinh động:** Hiển thị biểu tượng tích xanh (`✓`) khi thả đúng, dấu nhân đỏ (`×`) kèm hiệu ứng nảy về vị trí cũ khi thả sai, và hiệu ứng ngôi sao chúc mừng khi hoàn tất màn chơi.
- **Vào phòng chơi qua mã PIN:** Học sinh và giáo viên chỉ cần nhập mã PIN 6 số để mở phòng chơi ngay tức thì, không cần đăng ký tài khoản cho trẻ.
- **Bàn làm việc Giáo viên / Quản trị viên (Admin Desk):**
  - Đăng nhập bảo mật bằng JWT.
  - Tải lên hình ảnh giáo cụ (hỗ trợ tích hợp Cloudinary CDN).
  - Cấu hình luật ghép nối rổ - quả trực quan.
  - Tạo phiên chơi theo nhóm lớp và theo dõi biến đếm lỗi sai theo thời gian thực.
- **Thiết kế Chuẩn Touch-Friendly:** Kích thước vùng chạm lớn, tương thích hoàn hảo trên iPad, Tablet Android, màn hình cảm ứng thông minh và máy tính bảng.

---

## 2. Công nghệ Sử dụng

| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò & Đặc điểm |
| :--- | :--- | :--- | :--- |
| **Frontend** | Angular | 18.2 | Standalone Components, Signals, Reactive RxJS |
| **Tương tác UI** | Angular CDK Drag & Drop | 18.2 | Xử lý sự kiện kéo thả touch-friendly mượt mà |
| **Styling** | Tailwind CSS | 3.4 | Tiện ích CSS hiện đại, thiết kế Responsive đa kích thước |
| **Backend** | Spring Boot (Java) | 3.4.4 (Java 17) | RESTful API, Lombok, Spring Security |
| **Xác thực** | JWT (JJWT) | 0.12.6 | Xác thực Stateless Bearer Token cho Admin API |
| **Cơ sở dữ liệu** | MongoDB | 6.0+ | Lưu trữ Document linh hoạt cho Game, Session, Admin |
| **Lưu trữ CDN** | Cloudinary | 1.39.0 | Tối ưu hóa phân phối hình ảnh (qua `FileStorageService`) |
| **Container** | Docker | Eclipse Temurin 17 JRE | Đóng gói Backend container sẵn sàng deploy |

---

## 3. Cấu trúc Dự án (Monorepo)

```
kid-game-edu/
├── backend/                  # Mã nguồn Spring Boot 3 (REST API)
│   ├── src/main/java/        # Controllers, Services, Entities, Security
│   ├── src/main/resources/   # application.yml cấu hình hệ thống
│   ├── src/test/             # Unit tests (JUnit 5, Mockito)
│   ├── Dockerfile            # Cấu hình containerization cho Backend
│   └── pom.xml               # Quản lý thư viện Maven
├── frontend/                 # Mã nguồn Angular 18 (SPA Client)
│   ├── src/app/              # Standalone Components, API Services, Models
│   ├── package.json          # Thư viện npm
│   └── tailwind.config.js    # Cấu hình giao diện Tailwind
└── docs/                     # Tài liệu thiết kế hệ thống chi tiết
    ├── README.md             # Tài liệu tổng quan (file hiện tại)
    ├── PRODUCT_REQUIREMENTS.md # Đặc tả yêu cầu sản phẩm (PRD)
    ├── ARCHITECTURE.md       # Kiến trúc hệ thống & Danh sách REST API
    ├── DATABASE.md           # Thiết kế Schema MongoDB & Indexes
    ├── IMPLEMENTATION_PLAN.md# Lộ trình triển khai & Trạng thái công việc
    └── copilot-instructions.md # Hướng dẫn sinh mã cho GitHub Copilot
```

---

## 4. Hướng dẫn Khởi chạy Nhanh (Getting Started)

### 4.1. Yêu cầu Hệ thống
- **Java:** JDK 17 trở lên.
- **Maven:** 3.8+ (hoặc sử dụng file wrapper `./mvnw` có sẵn trong thư mục `backend`).
- **Node.js:** Phiên bản 18.x hoặc 20.x trở lên, kèm `npm` 9+.
- **MongoDB:** Cài đặt cục bộ trên cổng `27017` hoặc URI kết nối tới MongoDB Atlas.

---

### 4.2. Khởi chạy Backend (Spring Boot)

1. Mở terminal và di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cấu hình biến môi trường hoặc chỉnh sửa file `src/main/resources/application.yml`:
   ```bash
   export MONGODB_URI="mongodb://localhost:27017/kid_game_edu"
   export JWT_SECRET="your-256-bit-secret-key-at-least-32-chars-long"
   export ADMIN_USERNAME="admin"
   export ADMIN_PASSWORD="admin_password"
   export DEMO_SEED_ENABLED=true
   ```

3. Chạy ứng dụng bằng Maven:
   ```bash
   mvn spring-boot:run
   ```
   *Backend sẽ khởi động tại địa chỉ: `http://localhost:8080`*.  
   *Kiểm tra trạng thái health check:* `curl http://localhost:8080/api/health` trả về `{"status":"UP"}`.

> **Mẹo Demo:** Khi bật `DEMO_SEED_ENABLED=true`, hệ thống sẽ tự động khởi tạo sẵn trò chơi mẫu và phòng chơi với mã PIN `123456`.

---

### 4.3. Khởi chạy Frontend (Angular)

1. Mở terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```

3. Khởi động máy chủ phát triển Angular:
   ```bash
   npm start
   ```

4. Mở trình duyệt và truy cập: `http://localhost:4200`
   - **Chơi thử:** Nhập mã PIN `123456` và bấm **"Let's go!"** để bắt đầu chơi.
   - **Vào trang Quản trị:** Bấm vào nút **"Teacher login"** ở góc phải trên màn hình, đăng nhập với tài khoản admin đã cấu hình.

---

## 5. Danh mục Biến Môi trường (Environment Variables)

| Tên biến | Giá trị mặc định | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Không | Cổng dịch vụ Backend |
| `MONGODB_URI` | `mongodb://localhost:27017/kid_game_edu` | Có | Chuỗi kết nối MongoDB cục bộ hoặc Atlas |
| `JWT_SECRET` | *(Trống)* | Có khi dùng JWT | Chuỗi bí mật ký token JWT (tối thiểu 256 bits) |
| `JWT_EXPIRATION_MS`| `86400000` (24 giờ) | Không | Thời gian sống của JWT token |
| `ADMIN_USERNAME` | *(Trống)* | Không | Tên tài khoản Admin tạo tự động lần đầu |
| `ADMIN_PASSWORD` | *(Trống)* | Không | Mật khẩu tài khoản Admin tạo tự động |
| `DEMO_SEED_ENABLED`| `false` | Không | Tự động tạo dữ liệu game và PIN `123456` mẫu |
| `CLOUDINARY_ENABLED`| `false` | Không | Bật tính năng tải ảnh lên Cloudinary |
| `CLOUDINARY_CLOUD_NAME`| *(Trống)* | Khi bật | Tên Cloudinary cloud |
| `CLOUDINARY_API_KEY`| *(Trống)* | Khi bật | API Key Cloudinary |
| `CLOUDINARY_API_SECRET`| *(Trống)* | Khi bật | API Secret Cloudinary |

---

## 6. Kiểm thử & Đóng gói (Testing & Build)

### Kiểm thử Backend:
```bash
cd backend
mvn test
```

### Đóng gói ứng dụng:
- **Build Backend JAR:**
  ```bash
  cd backend
  mvn clean package -DskipTests
  ```
- **Build Docker Image:**
  ```bash
  cd backend
  docker build -t kid-game-edu-backend .
  ```
- **Build Frontend Production:**
  ```bash
  cd frontend
  npm run build
  ```

---

## 7. Tài liệu Tham chiếu Liên quan

Để tìm hiểu sâu hơn về kiến trúc và thiết kế hệ thống, vui lòng tham khảo các tài liệu chuyên đề:

- [Product Requirements (PRD)](./PRODUCT_REQUIREMENTS.md): Đặc tả yêu cầu chi tiết, câu chuyện người dùng và tiêu chuẩn UI/UX cho trẻ nhỏ.
- [System Architecture](./ARCHITECTURE.md): Kiến trúc tách biệt Client-Server, sơ đồ tuần tự và danh sách đầy đủ các REST API endpoints.
- [Database Schema](./DATABASE.md): Thiết kế Schema MongoDB, sơ đồ ERD, chỉ mục (Indexes) và JSON document mẫu.
- [Implementation Plan](./IMPLEMENTATION_PLAN.md): Lộ trình chi tiết từng Phase và trạng thái các đầu việc.
- [Copilot Instructions](./copilot-instructions.md): Hướng dẫn tiêu chuẩn lập trình dành cho AI và lập trình viên.
