// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthed } from '../api/auth';

export default function ProtectedRoute({ element }) {
  const location = useLocation(); // where the user tried to go
  return isAuthed()
    ? element
    : <Navigate to="/admin/login" replace state={{ from: location }} />;
}
