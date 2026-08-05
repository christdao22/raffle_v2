import type { AppType } from "@raffle_v2/api";
import { hc } from "hono/client";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// credentials: "include" is required so the Better Auth session cookie
// gets sent along with requests to the API's origin in dev (:5173 -> :3000).
export const api = hc<AppType>(apiUrl, {
  init: { credentials: "include" },
});

