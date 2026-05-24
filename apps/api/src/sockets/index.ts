import type { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { config } from "../config";
import {
  WS_EVENTS,
  type AssignmentFailedPayload,
  type AssignmentReadyPayload,
  type AssignmentStatusPayload,
} from "@vedaai/shared";

let io: IOServer | null = null;

export function initSocketServer(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: { origin: config.corsOrigin, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on(WS_EVENTS.SUBSCRIBE, (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId.length > 0) {
        socket.join(`assignment:${assignmentId}`);
      }
    });
  });

  console.log("[socket.io] gateway ready");
  return io;
}

function room(assignmentId: string) {
  return `assignment:${assignmentId}`;
}

export function emitStatus(payload: AssignmentStatusPayload) {
  io?.to(room(payload.assignmentId)).emit(WS_EVENTS.STATUS, payload);
}

export function emitReady(payload: AssignmentReadyPayload) {
  io?.to(room(payload.assignmentId)).emit(WS_EVENTS.READY, payload);
}

export function emitFailed(payload: AssignmentFailedPayload) {
  io?.to(room(payload.assignmentId)).emit(WS_EVENTS.FAILED, payload);
}
