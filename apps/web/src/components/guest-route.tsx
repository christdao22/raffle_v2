import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";

export function GuestRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center  bg-surface text-on-surface  px-4">
      <Outlet />
    </div>
  );
}
