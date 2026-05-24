import { io, type Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, { transports: ["websocket", "polling"], autoConnect: true });
  }
  return socket;
}
