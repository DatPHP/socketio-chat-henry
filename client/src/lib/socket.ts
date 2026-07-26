// src/lib/socket.ts
// File này tạo ra DUY NHẤT 1 instance socket client, dùng chung cho cả app.
// Lý do phải là singleton (chỉ 1 instance): nếu mỗi component tự gọi io(),
// bạn sẽ vô tình mở nhiều kết nối song song cho cùng 1 user -> lãng phí,
// và các event sẽ bị nhân đôi/ba khi nhiều component cùng lắng nghe.

import { io, Socket } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// { autoConnect: false } -> ta sẽ TỰ chủ động gọi socket.connect()
// khi thật sự cần (ví dụ lúc user bấm "Join Room"), thay vì kết nối
// ngay khi app vừa load trang (lãng phí nếu user chưa vào phòng nào).
export const socket: Socket = io(SERVER_URL, { autoConnect: false });