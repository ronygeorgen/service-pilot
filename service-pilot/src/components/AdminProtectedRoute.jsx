import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminProtectedRoute = ({ children }) => {
  const { isLoginned, admin_info } = useSelector(state => state.admin);
  const isLoggedIn = isLoginned || !!admin_info;

  // Allow if admin is logged in or if a valid locationId is passed

  if (isLoggedIn) {
    return children;
  }

  // Preserve original query params during redirection
  return <Navigate to={`/admin/login${location.search}`} replace />;
};

export default AdminProtectedRoute;
