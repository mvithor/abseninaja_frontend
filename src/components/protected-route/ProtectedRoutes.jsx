import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { role, accessToken } = useSelector((state) => state.user);

  if (!accessToken) {
    // Jika tidak ada token, arahkan ke halaman login
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(role)) {
    // Jika role tidak diizinkan, arahkan ke halaman forbidden
    return <Navigate to="/auth/forbidden" />;
  }

  // Jika akses diizinkan, render komponen yang dimasukkan ke dalam <Outlet />
  return <Outlet />;
};

export default ProtectedRoute;
