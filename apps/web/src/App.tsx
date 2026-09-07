import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PublicHome } from "./components/PublicHome";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { VehiclesPage } from "./pages/VehiclesPage";
import { DriversPage } from "./pages/DriversPage";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { CalendarPage } from "./pages/CalendarPage";
import { ReportsPage } from "./pages/ReportsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CustomerAccountPage } from "./pages/CustomerAccountPage";

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

function RequireCustomer({ children }: ProtectedRouteProps) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "CUSTOMER") {
    if (isStaffOrAdmin(user)) {
      return <Navigate to="/dashboard" replace />;
    }

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
    return (
      <DashboardLayout>
        <AdminDashboard />
      </DashboardLayout>
    );
  }

  if (user.role === "STAFF") {
    return (
      <DashboardLayout>
        <StaffDashboard />
      </DashboardLayout>
    );
  }

  return <Navigate to="/" replace />;
}

function OperationsPage({ children }: ProtectedRouteProps) {
  return (
    <RequireStaffOrAdmin>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireStaffOrAdmin>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/account"
        element={
          <RequireCustomer>
            <CustomerAccountPage />
          </RequireCustomer>
        }
      />

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
          <OperationsPage>
            <BookingsPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/customers"
        element={
          <OperationsPage>
            <CustomersPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/payments"
        element={
          <OperationsPage>
            <PaymentsPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/maintenance"
        element={
          <OperationsPage>
            <MaintenancePage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/calendar"
        element={
          <OperationsPage>
            <CalendarPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/reports"
        element={
          <OperationsPage>
            <ReportsPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/vehicles"
        element={
          <OperationsPage>
            <VehiclesPage />
          </OperationsPage>
        }
      />

      <Route
        path="/dashboard/drivers"
        element={
          <OperationsPage>
            <DriversPage />
          </OperationsPage>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
