import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles, allowedServiceModels }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  if (
    user?.role === "CLIENT" &&
    allowedServiceModels &&
    !allowedServiceModels.includes(user?.serviceModel)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
