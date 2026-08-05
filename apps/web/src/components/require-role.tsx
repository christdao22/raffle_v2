import type { Role } from "@raffle_v2/shared";
import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";

/**
 * Nest this INSIDE <ProtectedRoute> for routes that need more than just
 * "any authenticated user". It only does the role check + <Outlet/> - no
 * shell, no loading state - because ProtectedRoute (the parent layout
 * route) already handled auth/loading and rendered the Nav before this
 * ever gets a chance to render.
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />          // any role
 *
 *     <Route element={<RequireRole roles={["admin"]} />}>
 *       <Route path="/participants" element={<Participants />} />
 *     </Route>
 *   </Route>
 *
 * Takes an array specifically so one route can be opened to several
 * roles (e.g. roles={["admin", "manager"]}) without duplicating the
 * route - duplicating a path under two separate guards doesn't work with
 * react-router, since only one of the duplicates can ever match a given
 * URL, so the other role branch is simply dead code.
 */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { data: session } = useSession();

  if (!session || !roles.includes(session.user.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

