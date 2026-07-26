// src/lib/useRoomSocket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { MessageItem } from "@/lib/api";

interface RoomUser {
  id: string;
  name: string;
}

export function useRoomSocket(params: {
  roomCode: string;
  userId: string;
  userName: string;
  initialMessages: MessageItem[];
  enabled: boolean; // ✅ MỚI: chỉ thật sự connect/join khi cờ này = true
}) {
  const { roomCode, userId, userName, initialMessages, enabled } = params;

  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState<string>("");

  useEffect(() => {
    // ✅ FIX LỖI 1: nếu chưa đủ điều kiện (chưa có userId thật, hoặc
    // chưa có roomCode), KHÔNG làm gì cả — không connect, không join.
    // Effect sẽ tự chạy lại đúng 1 lần nữa khi `enabled` chuyển thành true.
    if (!enabled || !roomCode || !userId) {
      return;
    }

    socket.connect();

    function handleConnect() {
      socket.emit("join_room", { roomCode, userId, userName });
    }

    function handleRoomUsersUpdated(data: { users: RoomUser[] }) {
      setOnlineUsers(data.users);
      setIsJoined(true);
    }

    function handleNewMessage(data: { message: MessageItem }) {
      setMessages((prev) => [...prev, data.message]);
    }

    function handleJoinError(data: { message: string }) {
      setJoinError(data.message);
    }

    socket.on("connect", handleConnect);
    socket.on("room_users_updated", handleRoomUsersUpdated);
    socket.on("new_message", handleNewMessage);
    socket.on("join_room_error", handleJoinError);

    if (socket.connected) {
      handleConnect();
    }

    // ✅ FIX LỖI 2: không cần useRef nữa — vì bây giờ `roomCode`/`userId`
    // đã là tham số của CHÍNH closure này (được "chụp" lại đúng giá trị
    // tại thời điểm effect này chạy), không có chuyện bị "cũ" như useRef
    // không đồng bộ nữa. Đây gọi là closure trong JS: hàm cleanup dưới
    // đây luôn nhớ đúng roomCode/userId của LẦN effect này, không lẫn
    // sang lần khác.
    return () => {
      socket.emit("leave_room", { roomCode, userId, userName }); // ✅ thêm userName
      socket.off("connect", handleConnect);
      socket.off("room_users_updated", handleRoomUsersUpdated);
      socket.off("new_message", handleNewMessage);
      socket.off("join_room_error", handleJoinError);
      socket.disconnect();
    };
  }, [roomCode, userId, userName, enabled]);

  function sendMessage(content: string) {
    if (!content.trim()) return;
    socket.emit("send_message", { roomCode, userId, content });
  }

  return { messages, onlineUsers, isJoined, joinError, sendMessage };
}