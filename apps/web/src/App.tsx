import { PublicHome } from "./components/PublicHome";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { VehiclesPage } from "./pages/VehiclesPage";
import { DriversPage } from "./pages/DriversPage";
import { BookingsPage } from "./pages/BookingsPage";
import { LoginPage } from "./pages/LoginPage";
import { getStoredUser, isStaffOrAdmin } from "./lib/auth";

function redirectToLogin() {
  window.location.href = "/login";
  return null;
}

function App() {
  const path = window.location.pathname;
  const user = getStoredUser();

  if (path.startsWith("/login")) {
    return <LoginPage />;
  }


  if (path.startsWith("/dashboard/bookings")) {
    if (!user) {
      return redirectToLogin();
    }

    if (!isStaffOrAdmin(user)) {
      window.location.href = "/dashboard";
      return null;
    }

    return <BookingsPage />;
  }

  if (path.startsWith("/dashboard/drivers")) {
    if (!user) {
      return redirectToLogin();
    }

    if (!isStaffOrAdmin(user)) {
      window.location.href = "/dashboard";
      return null;
    }

    return <DriversPage />;
  }

  if (path.startsWith("/dashboard/vehicles")) {
    if (!user) {
      return redirectToLogin();
    }

    if (!isStaffOrAdmin(user)) {
      window.location.href = "/dashboard";
      return null;
    }

    return <VehiclesPage />;
  }

  if (path.startsWith("/dashboard")) {
    if (!user) {
      return redirectToLogin();
    }

    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />;

      case "STAFF":
        return <StaffDashboard />;

      default:
        window.location.href = "/";
        return null;
    }
  }

  return <PublicHome />;
}

export default App;
