import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../../utils/utils';

const ProtectedRoute = () => {
  const sessionCookie = getCookie();

  if (!sessionCookie) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
