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

function parseOrigins(raw: string): Array<string | RegExp> {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (!s.includes("*")) return s;
      const escaped = s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`);
    });
}

const allowedOrigins = parseOrigins(config.corsOrigin);

export function initSocketServer(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        for (const o of allowedOrigins) {
          if (typeof o === "string" ? o === origin : o.test(origin)) {
            return callback(null, true);
          }
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    },
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
