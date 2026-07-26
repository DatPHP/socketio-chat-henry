// src/queues/activityLog.worker.ts
// "Worker" là tiến trình LẤY job ra khỏi hàng đợi và xử lý thật.
// Ở bài học này, Worker chạy CHUNG process với server (đơn giản cho dev),
// nhưng trong hệ thống lớn thật, Worker thường chạy ở process/máy RIÊNG,
// để nếu xử lý job bị chậm/crash, không ảnh hưởng tới server chính
// đang phục vụ user.

import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/prisma";
import { ActivityLogJobData } from "./activityLog.queue";

export function startActivityLogWorker() {
  const worker = new Worker<ActivityLogJobData>(
    "activity-log", // PHẢI khớp tên với Queue ở Bước 7.5
    async (job: Job<ActivityLogJobData>) => {
      const { roomCode, userId, userName, action } = job.data;

      // Đây chính là việc "chậm mà không sao" — ghi vào DB, KHÔNG có ai
      // đang chờ kết quả này cả (khác với setUserRoom, phải await ngay
      // trong socket handler vì ảnh hưởng trực tiếp tới presence).
      await prisma.activityLog.create({
        data: { roomCode, userId, userName, action },
      });

      console.log(`📝 [Worker] Đã ghi log: ${userName} ${action} phòng ${roomCode}`);
    },
    { connection: redisConnection }
  );

  worker.on("failed", (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} thất bại:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`✅ [Worker] Job ${job.id} hoàn thành`);
  });

  return worker;
}