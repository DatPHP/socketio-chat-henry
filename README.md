# Socket.io Chat Practice

![Server CI](https://github.com/DatPHP/socketio-chat-practice/actions/workflows/server-ci.yml/badge.svg)
![Client CI](https://github.com/DatPHP/socketio-chat-practice/actions/workflows/client-ci.yml/badge.svg)

Ứng dụng chat realtime xây dựng để học sâu WebSocket/Socket.io, kết hợp với các công nghệ hiện đại ở cả Frontend và Backend.

## 🚀 Tech Stack & Technologies

**Frontend (Client)**
- **Framework:** Next.js (React 19)
- **Styling:** Tailwind CSS v4, Sass
- **State Management & Data Fetching:** React Query v5, Axios
- **Real-time:** Socket.io-client

**Backend (Server)**
- **Runtime:** Node.js, Express
- **Real-time:** Socket.io
- **Database ORM:** Prisma (PostgreSQL)
- **Background Jobs:** BullMQ, Redis (ioredis)
- **Testing:** Jest, ts-jest

**CI/CD & DevOps**
- GitHub Actions (Linting & Testing)

## 📁 Directory Structure

Dự án được cấu trúc theo dạng simple monorepository:
- `/client`: Chứa mã nguồn Frontend (Next.js).
- `/server`: Chứa mã nguồn Backend (Express, Socket.io, Prisma, Queue, Jest).
- `.github`: Chứa cấu hình CI/CD workflows (GitHub Actions).

## ✨ Key Features & Functions

- **Quản lý phòng chat:** Tự động tạo mã phòng (room code), chọn và tham gia phòng chat.
- **Nhắn tin Real-time:** Gửi và nhận tin nhắn ngay lập tức (broadcast message).
- **Trạng thái Online (Presence):** Hiển thị danh sách người dùng đang online trong cùng một phòng.
- **Lịch sử tin nhắn:** Tải lại lịch sử trò chuyện cũ khi tham gia phòng qua REST API.
- **Xử lý nền (Background Jobs):** Ghi log hoạt động tham gia/rời phòng (join/leave) sử dụng queue (BullMQ + Redis) để không block luồng xử lý socket chính.
- **Testing & CI:** Hệ thống unit test tự động (Jest) và kiểm tra liên tục qua GitHub Actions mỗi khi push code.

## ⚙️ Installation & Setup

1. **Clone dự án:**
   ```bash
   git clone https://github.com/DatPHP/socketio-chat-practice.git
   cd socketio-chat-practice
   ```

2. **Cài đặt dependencies:**
   Mở 2 terminal và chạy lệnh sau ở từng thư mục:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm install

   # Terminal 2 - Frontend
   cd client
   npm install
   ```

3. **Cấu hình biến môi trường (Environment Variables):**
   - Đảm bảo bạn đã cấu hình môi trường cho cơ sở dữ liệu **PostgreSQL** và **Redis**.
   - **Backend**: Cần có tệp `server/.env` thiết lập `DATABASE_URL` (cho Prisma) và cấu hình kết nối Redis (cho BullMQ).
   - **Frontend**: Cần có cấu hình environment phù hợp nếu gọi API bên ngoài (trong `.env.local` nếu có).

4. **Khởi tạo Database & Seed (Backend):**
   ```bash
   cd server
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Chạy ứng dụng (Development):**
   ```bash
   # Khởi động Backend (cần chạy Redis & Postgres trước)
   cd server
   npm run dev

   # Khởi động Frontend
   cd client
   npm run dev
   ```

## 🧪 Testing

Hệ thống backend được viết sẵn unit test bằng Jest. Để chạy test:
```bash
cd server
npm test           # Chạy một lần
npm run test:watchAll # Chạy chế độ watch
```

## 🎯 Development Phases (Completed)

Dựa theo lộ trình phát triển, dự án này đã hoàn tất các giai đoạn sau:

- [x] **Phase 0** — Initialize project structure (simple monorepository: `/server`, `/client`), install dependencies
- [x] **Phase 1** — Design & migrate Prisma schema (User, Room, Message), seed 4-5 fixed rooms with automatically generated room code
- [x] **Phase 2** — Build a basic Express server + connect to Socket.io (no logic yet, just handshake "connect/disconnect" to understand the connection lifecycle)
- [x] **Phase 3** — REST API: GET room list, GET message history of a room (Axios + React Query in FE call)
- [x] **Phase 4** — Room selection page + Name/Email form (Next.js + Tailwind)
- [x] **Phase 5** — Core Socket.io logic: `join_room`, `leave_room`, broadcast message, presence (list of who is online in the room)
- [x] **Phase 6** — Chat UI: display real-time messages, send using Enter/Send button, auto-scroll
- [x] **Phase 7** — BullMQ: queue for logging room activity (join/leave) running in the background, not blocking socket events
- [x] **Phase 8** — Jest unit testing (e.g., room generation code, service for creating messages)
- [x] **Phase 9** — CI/CD with GitHub Actions (lint + test when pushing)