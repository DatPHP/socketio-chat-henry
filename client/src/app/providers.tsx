"use client";
// Provider phải là Client Component vì React Query dùng React Context + hooks,
// không tương thích với Server Component (mặc định của App Router Next.js).

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState để đảm bảo QueryClient chỉ được tạo 1 LẦN DUY NHẤT cho mỗi
  // phiên render của trình duyệt (không tạo mới ở mỗi lần re-render component).
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}