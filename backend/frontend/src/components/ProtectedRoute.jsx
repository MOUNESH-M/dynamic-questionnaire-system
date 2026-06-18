import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any route element that requires authentication.
 * Pass `allowedRoles` to additionally restrict by role
 * (e.g. ["ADMIN"]). Unauthenticated users are sent to /login;
 * authenticated users with the wrong role are sent home.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === "ADMIN" ? "/admin" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
