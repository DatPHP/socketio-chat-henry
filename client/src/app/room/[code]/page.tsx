"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchRoomMessages } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRoomSocket } from "@/lib/useRoomSocket";
import { MessageBubble } from "@/components/MessageBubble";

export default function ChatRoomPage() {
  const params = useParams<{ code: string }>();
  const roomCode = params.code;
  const router = useRouter();

  const { currentUser, isLoaded } = useCurrentUser();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy lịch sử chat cũ (REST API — Giai đoạn 3) TRƯỚC khi socket kết nối,
  // để không bị "khoảng trắng" lúc mới vào phòng.
  const { data, isLoading, error } = useQuery({
    queryKey: ["room-messages", roomCode],
    queryFn: () => fetchRoomMessages(roomCode),
    enabled: !!roomCode,
  });

  // ⚠️ Nếu chưa có currentUser (chưa từng Join Room qua trang chủ),
  // đá về lại trang chủ — không cho vào thẳng URL phòng mà chưa có danh tính.
  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.replace("/");
    }
  }, [isLoaded, currentUser, router]);

    const { messages, onlineUsers, isJoined, joinError, sendMessage } = useRoomSocket({
    roomCode,
    userId: currentUser?.id ?? "",
    userName: currentUser?.name ?? "",
    initialMessages: data?.messages ?? [],
    enabled: isLoaded && !!currentUser, // ✅ chỉ bật khi đã đọc xong localStorage VÀ có user thật
    });

  // Tự động cuộn xuống tin nhắn mới nhất mỗi khi có message mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    sendMessage(input);
    setInput("");
  }

  // Enter để gửi, Shift+Enter để xuống dòng (quy ước UX chat phổ biến)
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  function handleExitRoom() {
    router.push("/"); // useRoomSocket cleanup sẽ tự emit "leave_room"
  }

  if (!isLoaded || isLoading || !currentUser) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy phòng này</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div>
          <h1 className="font-bold text-gray-800">{data?.room.name}</h1>
          <p className="text-xs text-gray-500">
            🟢 {onlineUsers.length} người online: {onlineUsers.map((u) => u.name).join(", ")}
          </p>
        </div>
        <button
          onClick={handleExitRoom}
          className="text-sm text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
        >
          Exit Room
        </button>
      </div>

      {joinError && (
        <p className="text-center text-red-500 text-sm py-2">{joinError}</p>
      )}
      {!isJoined && !joinError && (
        <p className="text-center text-gray-400 text-sm py-2">Đang kết nối...</p>
      )}

      {/* Danh sách message */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.user.id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="flex items-center gap-2 px-4 py-3 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}