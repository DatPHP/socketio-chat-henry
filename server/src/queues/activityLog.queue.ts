// src/queues/activityLog.queue.ts
// "Queue" là nơi TA GỬI job vào — giống như bỏ thư vào hòm thư,
// không quan tâm ai/khi nào sẽ lấy ra xử lý.

import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

// Kiểu dữ liệu của 1 job — giúp TypeScript check khi thêm job,
// tránh gõ nhầm tên field.
export interface ActivityLogJobData {
  roomCode: string;
  userId: string;
  userName: string;
  action: "join" | "leave";
}

// Tên "activity-log" là ĐỊNH DANH của hàng đợi này — Worker (Bước 7.6)
// phải dùng ĐÚNG TÊN NÀY để biết cần lắng nghe hàng đợi nào.
export const activityLogQueue = new Queue<ActivityLogJobData>("activity-log", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // nếu job lỗi (vd DB tạm thời down), tự thử lại tối đa 3 lần
    backoff: { type: "exponential", delay: 1000 }, // lần thử lại sau tăng dần: 1s, 2s, 4s
    removeOnComplete: true, // xóa job khỏi Redis ngay khi xử lý xong (đỡ tốn bộ nhớ)
    removeOnFail: false, // GIỮ LẠI job lỗi để bạn xem log debug sau này
  },
});