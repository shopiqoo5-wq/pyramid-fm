import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If user doesn't have required role, redirect to their respective dashboard
    const defaultRoute = currentUser.role === 'admin' ? '/admin' : '/portal';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
