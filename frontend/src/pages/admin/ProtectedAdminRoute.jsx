
import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const token = sessionStorage.getItem("adminToken");
  const adminUser = sessionStorage.getItem("adminUser");

  let admin;

  try {
    admin = JSON.parse(adminUser || "null");
  } catch {
    admin = null;
  }

  const isAuthenticated =
    Boolean(token) &&
    Boolean(admin) &&
    Boolean(admin.email);

  if (!isAuthenticated) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");

    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
