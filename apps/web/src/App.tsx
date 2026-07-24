import { PublicHome } from "./components/PublicHome";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/login")) {
    return <LoginPage />;
  }

  if (path.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <PublicHome />;
}

export default App;
