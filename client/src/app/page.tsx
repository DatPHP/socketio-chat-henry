"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchRooms, joinRoom, RoomListItem } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, isLoaded } = useCurrentUser();

  const [selectedRoom, setSelectedRoom] = useState<RoomListItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  // useMutation: dùng cho các thao tác THAY ĐỔI dữ liệu (POST/PUT/DELETE),
  // khác với useQuery chỉ dùng để ĐỌC dữ liệu.
  const joinMutation = useMutation({
    mutationFn: joinRoom,
    onSuccess: (data) => {
      setCurrentUser({ id: data.user.id, name: data.user.name, email: data.user.email });
      router.push(`/room/${data.room.code}`); // điều hướng sang trang chat (Giai đoạn 6)
    },
    onError: () => {
      setFormError("Không thể join phòng, thử lại nhé.");
    },
  });

  function handleSelectRoom(room: RoomListItem) {
    setSelectedRoom(room);
    setFormError("");
    // Nếu đã có currentUser (từ lần chat trước) thì tự điền sẵn form
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom) return;
    if (!name.trim() || !email.trim()) {
      setFormError("Vui lòng nhập đầy đủ Tên và Email");
      return;
    }
    joinMutation.mutate({ name, email, roomCode: selectedRoom.code });
  }

  if (!isLoaded || isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">💬 Chat Practice</h1>
        <p className="text-gray-500 mb-6">Chọn phòng và bắt đầu trò chuyện</p>

        {/* Danh sách phòng */}
        <div className="space-y-2 mb-6">
          {rooms?.map((room) => (
            <button
              key={room.id}
              onClick={() => handleSelectRoom(room)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                selectedRoom?.id === room.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{room.name}</span>
                <span className="text-xs text-gray-400">mã: {room.code}</span>
              </div>
              <span className="text-xs text-gray-500">
                🟢 {room._count.users} người đang online
              </span>
            </button>
          ))}
        </div>

        {/* Form Name/Email — chỉ hiện sau khi đã chọn 1 phòng */}
        {selectedRoom && (
          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
            <p className="text-sm text-gray-600">
              Đang tham gia: <strong>{selectedRoom.name}</strong>
            </p>
            <input
              type="text"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={joinMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {joinMutation.isPending ? "Đang vào phòng..." : "Join Room"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}// test ci trigger
