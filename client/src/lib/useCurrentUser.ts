// src/lib/useCurrentUser.ts
// Hook quản lý danh tính user hiện tại, lưu bền trong localStorage
// để reload trang không bị mất (không cần đăng nhập lại từ đầu).

"use client";

import { useCallback, useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

const STORAGE_KEY = "chat_current_user";

export function useCurrentUser() {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // tránh render sai lúc chưa đọc xong localStorage

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCurrentUserState(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY); // dữ liệu hỏng thì xóa luôn
      }
    }
    setIsLoaded(true);
  }, []);

  const setCurrentUser = useCallback((user: CurrentUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUserState(user);
  }, []);

  const clearCurrentUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUserState(null);
  }, []);

  return { currentUser, setCurrentUser, clearCurrentUser, isLoaded };
}