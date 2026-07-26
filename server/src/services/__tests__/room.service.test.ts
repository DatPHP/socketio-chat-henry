// src/services/__tests__/room.service.test.ts

// jest.mock() thay thế TOÀN BỘ module "../../config/prisma" bằng 1 bản giả
// TRƯỚC KHI file room.service.ts được import — nên khi room.service.ts
// gọi `import { prisma }`, nó sẽ nhận được bản giả này, không phải
// PrismaClient thật kết nối DB.
jest.mock("../../config/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "../../config/prisma";
import {
  getUsersInRoom,
  setUserRoom,
  createMessage,
  findRoomByCode,
} from "../room.service";

describe("room.service", () => {
  describe("getUsersInRoom", () => {
    it("gọi prisma.user.findMany với đúng điều kiện currentRoomId", async () => {
      const fakeUsers = [{ id: "u1", name: "Henry" }];
      // Ép hàm mock trả về giá trị giả định khi được gọi
      (prisma.user.findMany as jest.Mock).mockResolvedValue(fakeUsers);

      const result = await getUsersInRoom("room-123");

      // Kiểm tra: hàm THẬT SỰ được gọi đúng tham số mong đợi
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { currentRoomId: "room-123" },
        })
      );
      // Kiểm tra: kết quả trả về đúng bằng giá trị mock
      expect(result).toEqual(fakeUsers);
    });
  });

  describe("setUserRoom", () => {
    it("cập nhật currentRoomId thành công", async () => {
      const fakeUser = { id: "u1", currentRoomId: "room-123" };
      (prisma.user.update as jest.Mock).mockResolvedValue(fakeUser);

      const result = await setUserRoom("u1", "room-123");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { currentRoomId: "room-123" },
      });
      expect(result).toEqual(fakeUser);
    });

    it("trả về null và KHÔNG ném lỗi khi user không tồn tại (P2025)", async () => {
      // Giả lập đúng lỗi Prisma đã gặp thật ở Giai đoạn 6 —
      // đây chính là "regression test": đảm bảo bug đã fix không quay lại.
      const prismaError = Object.assign(new Error("Record not found"), {
        code: "P2025",
        clientVersion: "5.22.0",
        name: "PrismaClientKnownRequestError",
      });
      Object.setPrototypeOf(
        prismaError,
        require("@prisma/client").Prisma.PrismaClientKnownRequestError.prototype
      );
      (prisma.user.update as jest.Mock).mockRejectedValue(prismaError);

      const result = await setUserRoom("non-existent-id", "room-123");

      expect(result).toBeNull(); // KHÔNG được ném lỗi ra ngoài
    });
  });

  describe("createMessage", () => {
    it("tạo message với đúng roomId, userId, content", async () => {
      const fakeMessage = {
        id: "m1",
        content: "Hello",
        user: { id: "u1", name: "Henry" },
      };
      (prisma.message.create as jest.Mock).mockResolvedValue(fakeMessage);

      const result = await createMessage({
        roomId: "room-123",
        userId: "u1",
        content: "Hello",
      });

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { roomId: "room-123", userId: "u1", content: "Hello" },
        })
      );
      expect(result).toEqual(fakeMessage);
    });
  });

  describe("findRoomByCode", () => {
    it("tìm room đúng theo code", async () => {
      const fakeRoom = { id: "room-123", code: "J6gsak", name: "Tán Ngẫu" };
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(fakeRoom);

      const result = await findRoomByCode("J6gsak");

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { code: "J6gsak" },
      });
      expect(result).toEqual(fakeRoom);
    });
  });
});