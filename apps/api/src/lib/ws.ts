// src/lib/ws.ts
import type { WSContext } from "hono/ws";

export const activeSockets = new Set<WSContext>();

const latestEvents: Record<string, { payload: unknown }> = {};

export function broadcastEvent(type: string, payload: unknown): void {
  latestEvents[type] = { payload };

  const message = JSON.stringify({ type, payload });
  for (const ws of activeSockets) {
    ws.send(message);
  }
}

export function getSocketCount(): number {
  return activeSockets.size;
}

export function getLatestEvents(): Record<string, { payload: unknown }> {
  return latestEvents;
}
