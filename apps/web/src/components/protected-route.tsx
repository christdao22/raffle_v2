import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";
import CollapsibleSidebar from "./Custom/CollapsibleSidebar";

const ProtectedRoute = ({ allowedRole }: { allowedRole?: string }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const userRole = session.user.role || "attendant";

  if (allowedRole && userRole !== allowedRole) {
    // User doesn't have the right role, redirect to their dashboard
    return <Navigate to={`/`} replace />;
  }

  return (
    <div className="min-h-screen h-dvh bg-background flex">
      <CollapsibleSidebar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;
