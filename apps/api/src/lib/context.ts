import type { AuthSession, AuthUser } from "./auth";

export type AppEnv = {
  Variables: {
    user: AuthUser | null;
    session: AuthSession["session"] | null;
  };
};
