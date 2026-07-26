// jest.config.js
// Cấu hình Jest để hiểu được code TypeScript (mặc định Jest chỉ chạy JS thuần).

module.exports = {
  preset: "ts-jest", // dùng ts-jest để Jest tự compile file .ts trước khi chạy test
  testEnvironment: "node", // môi trường Node (không phải browser/jsdom, vì đây là server)
  testMatch: ["**/__tests__/**/*.test.ts"], // Jest sẽ tìm file test theo pattern này
  clearMocks: true, // tự động xóa mock giữa các test, tránh 1 test ảnh hưởng test khác
};