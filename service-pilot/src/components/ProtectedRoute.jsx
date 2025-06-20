import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ALLOWED_LOCATIONS = ["b8qvo7VooP3JD3dIZU42", "dIzpiRxQkIWkmFfr8T5j"];

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const locationId = params.get("location");

  const { isLoginned, admin_info } = useSelector(state => state.admin);
  const isLoggedIn = isLoginned || !!admin_info;

  const isAllowedViaLocation = locationId && ALLOWED_LOCATIONS.includes(locationId);

  if (isLoggedIn || isAllowedViaLocation) {
    return children;
  }

  return <Navigate to={`/user/login${location.search}`} replace />;
};

export default ProtectedRoute;
