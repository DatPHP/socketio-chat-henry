// src/services/roomCode.service.ts
// Hàm sinh mã phòng ngẫu nhiên 6 ký tự, gồm cả chữ thường/hoa và số.
// Ví dụ output: "J6gsak", "aZ3kD9"

// Bảng ký tự cho phép — bỏ các ký tự dễ gây nhầm lẫn khi đọc bằng mắt
// (không dùng: 0/O, 1/l/I) để user gõ tay mã phòng cho bạn bè không bị lỗi.
const CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Sinh 1 mã phòng ngẫu nhiên độ dài `length` ký tự (mặc định 6).
 * Dùng Math.random ở đây là ĐỦ TỐT cho mã phòng chat (không phải mật khẩu/bảo mật),
 * nên không cần crypto-secure random.
 */
export function generateRoomCode(length: number = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    result += CHARSET[randomIndex];
  }
  return result;
}