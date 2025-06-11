import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ALLOWED_LOCATIONS = ["b8qvo7VooP3JD3dIZU42", "dIzpiRxQkIWkmFfr8T5j"];

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const locationId = params.get("location");

  const { isLoginned, admin_info } = useSelector(state => state.admin);
  const isLoggedIn = isLoginned || !!admin_info;

  // Allow if admin is logged in or if a valid locationId is passed
  const isAllowedViaLocation = locationId && ALLOWED_LOCATIONS.includes(locationId);

  if (isLoggedIn || isAllowedViaLocation) {
    return children;
  }

  // Preserve original query params during redirection
  return <Navigate to={`/admin/login${location.search}`} replace />;
};

export default AdminProtectedRoute;
