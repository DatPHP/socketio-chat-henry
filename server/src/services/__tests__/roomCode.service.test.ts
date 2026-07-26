// src/services/__tests__/roomCode.service.test.ts

import { generateRoomCode } from "../roomCode.service";

// describe() = 1 nhóm test liên quan tới nhau, giúp output dễ đọc
describe("generateRoomCode", () => {
  // it() (hoặc test(), 2 tên đều dùng được, ý nghĩa giống nhau) = 1 trường hợp test cụ thể
  it("sinh ra chuỗi đúng độ dài mặc định (6 ký tự)", () => {
    const code = generateRoomCode();
    // expect(...).toBe(...) = khẳng định giá trị PHẢI đúng bằng giá trị mong đợi
    expect(code.length).toBe(6);
  });

  it("sinh ra chuỗi đúng độ dài khi truyền tham số tùy chỉnh", () => {
    const code = generateRoomCode(10);
    expect(code.length).toBe(10);
  });

  it("không chứa ký tự dễ nhầm lẫn (0, O, 1, l, I)", () => {
    // Chạy nhiều lần để tăng độ tin cậy (vì hàm dùng random, 1 lần chạy
    // có thể "may mắn" pass dù logic sai)
    for (let i = 0; i < 200; i++) {
      const code = generateRoomCode(20); // dùng độ dài lớn để tăng khả năng phát hiện lỗi
      expect(code).not.toMatch(/[0O1lI]/);
    }
  });

  it("2 lần gọi liên tiếp cho ra kết quả khác nhau (đủ ngẫu nhiên)", () => {
    const code1 = generateRoomCode();
    const code2 = generateRoomCode();
    // Về lý thuyết CÓ THỂ trùng (xác suất cực thấp với 6 ký tự từ bộ 57
    // ký tự — khoảng 1/57^6), nên test này CHẤP NHẬN rủi ro rất nhỏ đó
    // để giữ test đơn giản, thực tế gần như không bao giờ fail sai.
    expect(code1).not.toBe(code2);
  });

  it("chỉ chứa ký tự nằm trong bộ ký tự cho phép", () => {
    const code = generateRoomCode(50);
    const allowedPattern = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    expect(code).toMatch(allowedPattern);
  });
});