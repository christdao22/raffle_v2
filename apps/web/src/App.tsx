import { Navigate, Route, Routes } from "react-router";
import { GuestRoute } from "./components/guest-route";
import ProtectedRoute from "./components/protected-route";
import { RequireRole } from "./components/require-role";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import { Register } from "./pages/register";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />

        <Route element={<RequireRole roles={["admin", "attendant"]} />}>
          Hello Admin
          {/* <Route path="/participants" element={<Participants />} /> */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
