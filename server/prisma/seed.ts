// prisma/seed.ts
// Script này chạy 1 lần để tạo sẵn các phòng chat cố định trong DB.
// Mỗi phòng được sinh 1 mã code duy nhất bằng generateRoomCode().

import { PrismaClient } from "@prisma/client";
import { generateRoomCode } from "../src/services/roomCode.service";

const prisma = new PrismaClient();

const FIXED_ROOMS = [
  "Tán Ngẫu",
  "Phiếm",
  "Hóng Giá Vàng",
  "Rảnh Rỗi Sinh Nông Nổi",
  "Hội Săn Sale",
];

async function main() {
  for (const roomName of FIXED_ROOMS) {
    // Kiểm tra phòng đã tồn tại chưa (tránh seed trùng khi chạy lại script)
    const existing = await prisma.room.findFirst({ where: { name: roomName } });
    if (existing) {
      console.log(`⏭️  Phòng "${roomName}" đã tồn tại (code: ${existing.code}), bỏ qua.`);
      continue;
    }

    const code = generateRoomCode(6);
    const room = await prisma.room.create({
      data: { name: roomName, code },
    });
    console.log(`✅ Tạo phòng "${room.name}" — mã: ${room.code}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });