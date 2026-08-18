import { Settings } from "lucide-react";
import { Navigate, Route, Routes } from "react-router";
import { GuestRoute } from "./components/guest-route";
import ProtectedRoute from "./components/protected-route";
import { RequireRole } from "./components/require-role";
import { Dashboard } from "./pages/dashboard";
import { LiveDraw } from "./pages/livedraw";
import { Login } from "./pages/login";
import { Prizes } from "./pages/prizes";
import { Register } from "./pages/register";
import { Winners } from "./pages/winners";

export default function App() {
  const ComingSoon = () => (
    <div className="flex flex-col justify-center items-center h-full gap-6">
      <Settings className="animate-spin text-current duration-1000 " width={50} height={50} />{" "}
      <p>Coming Soon</p>
    </div>
  );

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/livedraw" element={<LiveDraw />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prizes" element={<Prizes />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/history" element={<ComingSoon />} />
        <Route path="/settings" element={<ComingSoon />} />

        <Route element={<RequireRole roles={["admin", "attendant"]} />}>
          Hello Admin
          {/* <Route path="/participants" element={<Participants />} /> */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
