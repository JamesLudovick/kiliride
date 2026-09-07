import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PublicHome } from "./components/PublicHome";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { VehiclesPage } from "./pages/VehiclesPage";
import { DriversPage } from "./pages/DriversPage";
import { BookingsPage } from "./pages/BookingsPage";
import { LoginPage } from "./pages/LoginPage";

import {
  getStoredUser,
  isStaffOrAdmin,
} from "./lib/auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

function RequireStaffOrAdmin({ children }: ProtectedRouteProps) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaffOrAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardHome() {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user.role === "STAFF") {
    return <StaffDashboard />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <RequireStaffOrAdmin>
            <DashboardHome />
          </RequireStaffOrAdmin>
        }
      />

      <Route
        path="/dashboard/bookings"
        element={
          <RequireStaffOrAdmin>
            <BookingsPage />
          </RequireStaffOrAdmin>
        }
      />

      <Route
        path="/dashboard/vehicles"
        element={
          <RequireStaffOrAdmin>
            <VehiclesPage />
          </RequireStaffOrAdmin>
        }
      />

      <Route
        path="/dashboard/drivers"
        element={
          <RequireStaffOrAdmin>
            <DriversPage />
          </RequireStaffOrAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
