import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { admin } = useAuth();

  // Admin Login မဝင်ထားပါက Login Page သို့ ပြန်ညွှန်းမည်
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;