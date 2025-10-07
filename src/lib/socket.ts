'use client';
import { io, Socket } from 'socket.io-client';

export interface UserInfo {
  nickname: string;
  gender: 'nam' | 'nữ' | 'khác';  // Map từ 'male'/'female'
  birthYear: number;
  location: string;  // Map từ 'region'
}

export const initSocket = (info: UserInfo): Socket => {
  const backend_url=process.env.NEXT_PUBLIC_BACKEND_URL||'';
  return io(backend_url, {  // Backend URL từ env (client-safe)
    auth: { info },
    transports: ['websocket', 'polling'],  // Fallback transport nếu WS fail
  });
};