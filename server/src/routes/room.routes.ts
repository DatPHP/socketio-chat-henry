// src/routes/room.routes.ts
// API để FE lấy danh sách các phòng đã seed sẵn, hiển thị ở trang chọn phòng.

import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

// GET /api/rooms
// Trả về danh sách phòng, kèm SỐ LƯỢNG user đang online trong mỗi phòng
// (dùng _count để đếm quan hệ User có currentRoomId = phòng đó, không cần
// query riêng từng phòng rồi đếm bằng tay — Prisma hỗ trợ sẵn).
router.get("/", async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        _count: {
          select: { users: true }, // đếm số user có currentRoomId = room này
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ rooms });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách room:", error);
    res.status(500).json({ error: "Không thể lấy danh sách phòng" });
  }
});

export default router;