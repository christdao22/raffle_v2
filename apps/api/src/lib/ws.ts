// src/lib/ws.ts (the single source)
import type { WSContext } from "hono/ws";

export const activeSockets = new Set<WSContext>();

export function broadcastEvent(type: string, payload: unknown): void {
  const message = JSON.stringify({ type, payload });
  for (const ws of activeSockets) {
    ws.send(message);
  }
}
