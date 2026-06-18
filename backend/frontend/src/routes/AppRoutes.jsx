import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import QuestionnaireBuilder from "../pages/QuestionnaireBuilder";
import UserDashboard from "../pages/UserDashboard";
import TakeQuestionnaire from "../pages/TakeQuestionnaire";

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/questionnaire/:questionnaireId"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <QuestionnaireBuilder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/take/:questionnaireId"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <TakeQuestionnaire />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
