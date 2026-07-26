// src/config/prisma.ts
// Tại sao cần file riêng thay vì "new PrismaClient()" ở mọi nơi?
// -> ts-node-dev reload code liên tục lúc dev, nếu không tái sử dụng 1 instance
//    duy nhất, mỗi lần reload sẽ tạo thêm 1 connection pool mới -> rò rỉ kết nối
//    tới Postgres (rất hay gặp lỗi "too many connections" với Neon).

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = global.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}