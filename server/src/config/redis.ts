// src/config/redis.ts
// Giống Prisma Client, ta cần 1 kết nối Redis DUY NHẤT dùng chung
// cho cả Queue (nơi thêm job) và Worker (nơi xử lý job).

import IORedis from "ioredis";

export const redisConnection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    // BullMQ YÊU CẦU giá trị này = null (không phải mặc định của ioredis
    // là số lần retry giới hạn) — nếu không set, BullMQ sẽ báo lỗi ngay
    // khi khởi tạo Queue/Worker. Đây là 1 "gotcha" quen thuộc khi mới học.
    maxRetriesPerRequest: null,
  }
);