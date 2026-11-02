# Tài liệu Kiến trúc Hệ thống (Architecture Document)

Tài liệu này cung cấp cái nhìn toàn diện về kiến trúc hệ thống, các luồng dữ liệu, quy chuẩn bảo mật và chi tiết kỹ thuật của dự án **Kid Game Edu**.

---

## 1. Tổng quan Kiến trúc Hệ thống

Hệ thống được xây dựng theo mô hình **Client-Server tách biệt (Decoupled Architecture)**. Thiết kế này giúp tối ưu hóa hiệu năng, tách bạch trách nhiệm và cho phép triển khai, mở rộng độc lập giữa tầng giao diện (Frontend) và tầng dịch vụ (Backend).

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Trình duyệt)"]
        TeacherAdmin["Giáo viên / Admin<br>(Desktop / Laptop)"]
        Kids["Trẻ mầm non<br>(iPad / Tablet / Touch screen)"]
        AngularApp["Angular 18 SPA<br>(Standalone Components + Angular CDK)"]
        TeacherAdmin --> AngularApp
        Kids --> AngularApp
    end

    subgraph CDNLayer ["CDN & Static Assets"]
        Cloudinary["Cloudinary CDN<br>(Lưu trữ & tối ưu hóa ảnh)"]
        OpenMoji["OpenMoji SVG CDN<br>(Biểu tượng trái cây)"]
    end

    subgraph BackendLayer ["Backend Services (Spring Boot 3 - Java 17)"]
        SpringGateway["Spring Security & CORS Filter"]
        AuthController["AuthController<br>/api/auth"]
        GameplayController["GameplayController<br>/api/gameplay"]
        GameController["GameController<br>/api/admin/games"]
        SessionController["SessionController<br>/api/admin/sessions"]
        StorageController["StorageController<br>/api/admin/storage"]
        
        GameService["GameService"]
        SessionService["SessionService"]
        FileStorageService["FileStorageService<br>(Abstraction Interface)"]
        CloudinaryImpl["CloudinaryStorageServiceImpl"]
    end

    subgraph DatabaseLayer ["Data Persistence"]
        MongoDB[("MongoDB Atlas<br>NoSQL Database")]
    end

    AngularApp -->|"HTTPS / REST API"| SpringGateway
    AngularApp -->|"Tải ảnh trực tiếp"| Cloudinary
    AngularApp -->|"Tải icon mặc định"| OpenMoji

    SpringGateway --> AuthController
    SpringGateway --> GameplayController
    SpringGateway --> GameController
    SpringGateway --> SessionController
    SpringGateway --> StorageController

    GameController --> GameService
    SessionController --> SessionService
    GameplayController --> SessionService
    StorageController --> FileStorageService
    FileStorageService -.-> CloudinaryImpl

    GameService --> MongoDB
    SessionService --> MongoDB
    CloudinaryImpl -->|"Upload API"| Cloudinary
```

---

## 2. Luồng Dữ liệu & Sơ đồ Tuần tự (Sequence Diagrams)

### 2.1. Luồng Xác thực PIN & Khởi tạo Màn chơi (Join Room)
Giáo viên hoặc trẻ nhập mã PIN 6 chữ số để mở khóa màn chơi.

```mermaid
sequenceDiagram
    autonumber
    actor User as Giáo viên / Trẻ
    participant FE as Angular Client
    participant BE as Spring Boot (/api/gameplay)
    participant DB as MongoDB

    User->>FE: Nhập mã PIN (VD: 123456) & ấn "Let's go!"
    FE->>BE: POST /api/gameplay/sessions/validate { pinCode: "123456" }
    BE->>DB: Tìm Session active theo pinCode
    alt Session không tồn tại hoặc isActive = false
        DB-->>BE: null
        BE-->>FE: 404 Not Found ("Session not found or inactive")
        FE-->>User: Hiển thị thông báo "Mã phòng chưa đúng, thử lại nhé!"
    else Session hợp lệ
        DB-->>BE: Session entity
        BE->>DB: Tìm Game entity theo session.gameId
        DB-->>BE: Game entity (buckets, items)
        BE-->>FE: 200 OK { session, game }
        FE->>FE: Load toàn bộ items & baskets vào bộ nhớ Client
        FE-->>User: Chuyển sang màn hình Gameplay
    end
```

### 2.2. Luồng Tương tác Kéo - Thả & Đếm lỗi (Zero-latency Gameplay)
Toàn bộ logic kiểm tra ghép đôi được xử lý tức thời trên Angular. Backend chỉ nhận request bất đồng bộ khi có lỗi sai phát sinh.

```mermaid
sequenceDiagram
    autonumber
    actor Kid as Trẻ mầm non
    participant FE as Angular Client (CDK DragDrop)
    participant BE as Spring Boot
    participant DB as MongoDB

    Kid->>FE: Kéo quả A thả vào rổ B
    FE->>FE: So khớp quả A.id với rổ B.fruitId (TargetBucketId)
    
    alt Trường hợp THẢ ĐÚNG
        FE->>FE: Đánh dấu rổ B là "correct" (hiện tick xanh)
        FE->>FE: Cố định quả vào rổ, ẩn khỏi cây
        FE->>FE: Cập nhật tiến độ placed.length
        alt Đã hoàn thành tất cả quả
            FE-->>Kid: Hiển thị màn hình "⭐ You did it! ⭐"
        else Chưa xong
            FE-->>Kid: Tiếp tục chơi
        end
    else Trường hợp THẢ SAI
        FE->>FE: Đánh dấu rổ B là "wrong" (hiện dấu X đỏ)
        FE->>FE: Kích hoạt hiệu ứng quả nảy về cây (.fruit-bounce-back)
        FE-->>Kid: Phản hồi thị giác tức thì (<50ms)
        FE-)BE: POST /api/gameplay/sessions/{pinCode}/mistakes (Gửi ngầm, async)
        BE->>DB: Cập nhật mistakeCount += 1
        DB-->>BE: Lưu thành công
    end
```

### 2.3. Luồng Quản trị: Tạo Game & Cấp mã PIN
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant FE as Angular Admin UI
    participant BE as Spring Boot (/api/admin)
    participant Cloud as Cloudinary
    participant DB as MongoDB

    Admin->>FE: Đăng nhập username/password
    FE->>BE: POST /api/auth/login
    BE-->>FE: JWT Token (lưu vào localStorage)

    Admin->>FE: Tải ảnh vật phẩm lên
    FE->>BE: POST /api/admin/storage/upload (Bearer JWT, multipart/form-data)
    BE->>Cloud: Upload image
    Cloud-->>BE: Secure Image URL & publicId
    BE-->>FE: { url, publicId }

    Admin->>FE: Nhập tên Game & mapping rổ - quả -> Bấm "Save published game"
    FE->>BE: POST /api/admin/games (Bearer JWT)
    BE->>DB: Lưu Game mới (status = PUBLISHED)
    DB-->>BE: Game saved
    BE-->>FE: Trả về thông tin Game đã lưu

    Admin->>FE: Chọn Game, nhập tên nhóm "Sunflowers" -> Bấm "Create room"
    FE->>BE: POST /api/admin/sessions { gameId, groupName }
    BE->>BE: Sinh ngẫu nhiên mã PIN 6 số (chưa tồn tại)
    BE->>DB: Lưu Session mới (isActive = true, mistakeCount = 0)
    DB-->>BE: Session saved
    BE-->>FE: Trả về Session kèm mã PIN
    FE-->>Admin: Hiển thị mã PIN nổi bật để phát cho lớp
```

---

## 3. Đặc tả Chi tiết Hệ thống REST API

Tất cả API trả về định dạng `application/json` (trừ trường hợp xóa trả về `204 No Content`).

### 3.1. Xác thực & Quản trị Hệ thống (`/api/auth`, `/api/health`)

| Endpoint | Method | Phân quyền | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Kiểm tra trạng thái hoạt động của Backend | Không | `{"status": "UP"}` (200 OK) |
| `/api/auth/login` | `POST` | Public | Đăng nhập tài khoản Admin, nhận JWT | `{"username": "...", "password": "..."}` | `{"token": "<JWT_STRING>"}` (200 OK) |

### 3.2. Gameplay Public API (`/api/gameplay`)
Dành cho giáo viên và học sinh tham gia phòng chơi, không yêu cầu Bearer Token mà định danh qua `pinCode`.

| Endpoint | Method | Phân quyền | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/gameplay/sessions/validate` | `POST` | Public | Xác thực mã PIN và lấy toàn bộ dữ liệu Game | `{"pinCode": "123456"}` | `{"session": {...}, "game": {...}}` (200 OK) |
| `/api/gameplay/sessions/{pinCode}` | `GET` | Public | Lấy cấu hình Game theo mã PIN | Không | `Game` object (200 OK) |
| `/api/gameplay/sessions/{pinCode}/mistakes` | `POST` | Public | Tăng số lần thao tác sai của phiên thêm 1 | Không | `Session` object đã cập nhật (200 OK) |

### 3.3. Quản lý Game (Admin Only - Yêu cầu Header `Authorization: Bearer <JWT>`)

| Endpoint | Method | Phân quyền | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/admin/games` | `GET` | Admin | Lấy danh sách tất cả các trò chơi | Không | `Game[]` (200 OK) |
| `/api/admin/games/{id}` | `GET` | Admin | Lấy chi tiết một trò chơi theo ID | Không | `Game` object (200 OK) |
| `/api/admin/games` | `POST` | Admin | Tạo trò chơi mới | `Game` entity | `Game` entity (201 Created) |
| `/api/admin/games/{id}` | `PUT` | Admin | Cập nhật trò chơi | `Game` entity | `Game` entity (200 OK) |
| `/api/admin/games/{id}/publish` | `POST` | Admin | Chuyển trạng thái sang `PUBLISHED` | Không | `Game` entity (200 OK) |
| `/api/admin/games/{id}` | `DELETE` | Admin | Xóa vĩnh viễn một trò chơi | Không | `204 No Content` |

### 3.4. Quản lý Phiên chơi (Admin Only - Yêu cầu Header `Authorization: Bearer <JWT>`)

| Endpoint | Method | Phân quyền | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/admin/sessions` | `GET` | Admin | Danh sách tất cả các phòng chơi | Không | `Session[]` (200 OK) |
| `/api/admin/sessions` | `POST` | Admin | Khởi tạo phòng chơi và sinh mã PIN | `{"gameId": "...", "groupName": "..."}` | `Session` entity (201 Created) |
| `/api/admin/sessions/{id}/deactivate` | `POST` | Admin | Đóng phòng chơi (`isActive = false`) | Không | `Session` entity (200 OK) |

### 3.5. Lưu trữ Tài nguyên Hình ảnh (Admin Only - Có điều kiện `cloudinary.enabled=true`)

| Endpoint | Method | Phân quyền | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/admin/storage/upload` | `POST` | Admin | Tải ảnh lên Cloudinary | `multipart/form-data` (field: `file`) | `{"url": "...", "publicId": "..."}` (201 Created) |
| `/api/admin/storage/{publicId}` | `DELETE` | Admin | Xóa ảnh khỏi Cloudinary | Không | `204 No Content` |

---

## 4. Các Quyết định Kiến trúc (Architectural Decision Records - ADR)

### ADR 01: Xử lý Kiểm tra Đúng/Sai hoàn toàn tại Client (Angular)
- **Bối cảnh:** Đối tượng người dùng là trẻ em mầm non với khả năng tập trung ngắn hạn. Mọi độ trễ mạng (>100ms) khi kéo thả sẽ tạo cảm giác giật, lag và làm giảm sự hứng thú.
- **Quyết định:** Khi nhập PIN, Client tải về toàn bộ cấu trúc bài tập (`buckets` và `items` có gắn `targetBucketId`). Toàn bộ việc so khớp đúng/sai được tính toán ngay trong callback `dropIntoBasket()` của Angular CDK.
- **Hệ quả:**
  - *Ưu điểm:* Phản hồi tức thì (<16ms, cùng tần số làm tươi khung hình 60fps), trải nghiệm mượt mà, không phụ thuộc kết nối internet lúc chơi.
  - *Nhược điểm:* Đáp án nằm ở Client (tuy nhiên với mô hình giáo dục mầm non, tính bảo mật của bài tập không phải là mối đe dọa gian lận).

### ADR 02: Trừu tượng hóa Tầng Lưu trữ Tập tin (`FileStorageService`)
- **Bối cảnh:** Hệ thống cần upload hình ảnh rổ và quả. Hiện tại sử dụng Cloudinary, nhưng có thể cần hỗ trợ lưu trữ nội bộ (Local Disk) hoặc AWS S3 trong tương lai.
- **Quyết định:** Áp dụng nguyên lý *Dependency Inversion (DIP)*. Định nghĩa interface `FileStorageService` trong core backend:
  ```java
  public interface FileStorageService {
      StoredFile upload(MultipartFile file) throws IOException;
      void delete(String publicId) throws IOException;
      record StoredFile(String url, String publicId) {}
  }
  ```
  Class `CloudinaryStorageServiceImpl` hiện thực interface này và được kích hoạt linh hoạt qua `@ConditionalOnProperty(name = "cloudinary.enabled", havingValue = "true")`.

### ADR 03: Bảo mật Phân tầng (JWT cho Admin & PIN cho Gameplay)
- **Bối cảnh:** Lớp học mầm non không thể yêu cầu từng nhóm trẻ đăng nhập tài khoản/mật khẩu phức tạp. Tuy nhiên dữ liệu quản trị cần được bảo vệ chặt chẽ.
- **Quyết định:**
  - Admin sử dụng Spring Security Stateless JWT Filter (`/api/admin/**`).
  - Học sinh chỉ cần mã PIN 6 số (`/api/gameplay/**`), không cần duy trì session phức tạp hay lưu trữ cookie.

---

## 5. Cấu trúc Mô-đun & Mã nguồn

Dự án tổ chức theo cấu trúc Monorepo tập trung:
```
kid-game-edu/
├── backend/                               # Spring Boot 3 Web Application
│   ├── src/main/java/com/kidgameedu/backend/
│   │   ├── auth/                          # Đăng nhập & sinh JWT
│   │   ├── config/                        # SecurityConfig, WebConfig (CORS), SeedData
│   │   ├── exception/                     # GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── game/                          # Controller, Service, Repository cho Game
│   │   ├── gameplay/                      # Public Gameplay API (PIN validation, mistakes)
│   │   ├── model/                         # MongoDB Entities (Admin, Game, Session, Bucket, Item)
│   │   ├── repository/                    # Spring Data Mongo Repositories
│   │   ├── security/                      # JwtService, JwtAuthFilter, UserDetailsService
│   │   ├── session/                       # Controller, Service, Repository cho Session
│   │   └── storage/                       # FileStorageService, CloudinaryStorageServiceImpl
│   ├── src/main/resources/application.yml # Cấu hình ứng dụng
│   ├── Dockerfile                         # Container build với Eclipse Temurin 17 JRE
│   └── pom.xml                            # Maven dependencies
├── frontend/                              # Angular 18 Single Page Application
│   ├── src/app/
│   │   ├── core/                          # Services (ApiService), Models, Interceptors (JwtInterceptor)
│   │   ├── app.component.ts               # Root component điều phối 3 màn hình (PIN, Play, Admin)
│   │   ├── app.component.html             # Template HTML chuẩn touch-friendly
│   │   └── app.component.css              # Styling giao diện mầm non, hoạt ảnh CSS
│   └── package.json                       # Angular CDK, Tailwind CSS
└── docs/                                  # Toàn bộ tài liệu kiến trúc & thiết kế
```

---

## 6. Chiến lược Triển khai & Vận hành (Deployment Architecture)

- **Frontend:** Build tĩnh bằng lệnh `ng build`, triển khai lên CDN như **Vercel** hoặc **Netlify**.
- **Backend:** Đóng gói dạng Docker image thông qua `backend/Dockerfile` chạy trên cổng `8080`, triển khai trên các PaaS như **Render**, **Railway** hoặc Kubernetes cluster.
- **Database:** MongoDB Atlas M0 (Free Tier) hoặc cụm Database chuyên dụng.
- **CORS:** Cấu hình trong `WebConfig.java` cho phép truy cập từ mọi domain (`allowedOriginPatterns("*")`) hoặc domain production chỉ định.
