// src/lib/api.ts
// Tập trung toàn bộ cấu hình Axios ở 1 chỗ (base URL, v.v.)
// để không phải lặp lại "http://localhost:4000" ở khắp nơi trong code.

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

// --- Types khớp với dữ liệu server trả về ---
export interface RoomListItem {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  _count: { users: number };
}

export interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

// --- Các hàm gọi API cụ thể ---

export async function fetchRooms(): Promise<RoomListItem[]> {
  const res = await api.get<{ rooms: RoomListItem[] }>("/rooms");
  return res.data.rooms;
}

export async function fetchRoomMessages(roomCode: string) {
  const res = await api.get<{
    room: { id: string; code: string; name: string };
    messages: MessageItem[];
  }>(`/rooms/${roomCode}/messages`);
  return res.data;
}

export interface JoinRoomResponse {
  user: { id: string; name: string; email: string; currentRoomId: string };
  room: { id: string; code: string; name: string };
}

export async function joinRoom(params: {
  name: string;
  email: string;
  roomCode: string;
}): Promise<JoinRoomResponse> {
  const res = await api.post<JoinRoomResponse>("/users/join", params);
  return res.data;
}

export async function exitRoom(userId: string) {
  const res = await api.post(`/users/${userId}/exit`);
  return res.data;
}