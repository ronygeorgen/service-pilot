// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const access = localStorage.getItem('access_token')

  if (!access) {
    return <Navigate to={`/admin/login`} replace />;
  }

  return children;
};

export default ProtectedRoute;