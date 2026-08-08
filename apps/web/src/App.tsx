import { PublicHome } from "./components/PublicHome";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { LoginPage } from "./pages/LoginPage";
import { getStoredUser } from "./lib/auth";

function App() {
  const path = window.location.pathname;
  const user = getStoredUser();

  if (path.startsWith("/login")) {
    return <LoginPage />;
  }

  if (path.startsWith("/dashboard")) {
    if (!user) {
      window.location.href = "/login";
      return null;
    }

    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />;

      case "STAFF":
        return <StaffDashboard />;

      default:
        return <PublicHome />;
    }
  }

  return <PublicHome />;
}

export default App;