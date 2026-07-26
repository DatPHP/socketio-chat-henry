// src/components/MessageBubble.tsx
import { MessageItem } from "@/lib/api";

// Format giờ:phút từ chuỗi ISO date, kiểu "14:35"
function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  isOwnMessage,
}: {
  message: MessageItem;
  isOwnMessage: boolean;
}) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold text-blue-500 mb-1">{message.user.name}</p>
        )}
        <p className="break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isOwnMessage ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}