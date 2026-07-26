// src/lib/useCurrentUser.ts
"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

const STORAGE_KEY = "chat_current_user";

// Hàm đọc giá trị HIỆN TẠI từ localStorage — dùng cho phía client
function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

// Hàm này được gọi lúc render ở SERVER (không có localStorage) — luôn
// trả về null, để tránh lỗi "localStorage is not defined" khi Next.js
// render lần đầu ở server-side.
function getServerSnapshot(): string | null {
  return null;
}

// subscribe: đăng ký lắng nghe sự kiện "storage" — bắn ra khi localStorage
// bị thay đổi TỪ TAB KHÁC (đây chính là API subscribe thật mà luật lint
// mong muốn, dù trong app này ít khi xảy ra vì ta chỉ có 1 tab thao tác).
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useCurrentUser() {
  // useSyncExternalStore tự xử lý đúng: lúc render server dùng getServerSnapshot,
  // lúc ở client dùng getSnapshot, và tự re-render khi subscribe() báo thay đổi.
  // KHÔNG cần useEffect + setState thủ công nữa -> hết luôn lỗi lint.
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let currentUser: CurrentUser | null = null;
  if (raw) {
    try {
      currentUser = JSON.parse(raw);
    } catch {
      currentUser = null;
    }
  }

  // isLoaded: trước đây dùng để phân biệt "chưa đọc xong" vs "đọc xong nhưng rỗng".
  // Với useSyncExternalStore, ở phía client giá trị luôn đã đọc xong ngay từ lần
  // render đầu tiên của client (không có độ trễ như useEffect), nên ta suy ra
  // isLoaded = true ngay khi đang chạy ở client (typeof window !== "undefined").
  const isLoaded = typeof window !== "undefined";

  const setCurrentUser = useCallback((user: CurrentUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Bắn sự kiện "storage" thủ công để useSyncExternalStore biết mà re-render
    // NGAY TRONG CHÍNH TAB NÀY (sự kiện storage mặc định của trình duyệt chỉ
    // tự bắn cho các tab KHÁC, không bắn cho tab vừa gọi setItem).
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  const clearCurrentUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  return { currentUser, setCurrentUser, clearCurrentUser, isLoaded };
}