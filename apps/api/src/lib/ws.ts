// src/lib/ws.ts
import type { WSContext } from "hono/ws";

export const activeSockets = new Set<WSContext>();

const latestEvents: Record<string, { payload: unknown }> = {};

export function broadcastEvent(type: string, payload: unknown): void {
  if (type === "COUNTDOWN") {
    delete latestEvents.WINNERS;
    delete latestEvents.MODAL_CLOSED;
  } else if (type === "WINNERS") {
    delete latestEvents.COUNTDOWN;
    delete latestEvents.MODAL_CLOSED;
  } else if (type === "MODAL_CLOSED") {
    delete latestEvents.COUNTDOWN;
    delete latestEvents.WINNERS;
  }

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
