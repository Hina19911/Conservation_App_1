import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Reservations from './components/Reservations';
import AdminLogin from './components/AdminLogin';
import AdminReservations from './components/AdminReservations';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">Conservation</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/reservations">Reservations</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/login">Admin</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Reservations />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reservations" element={<ProtectedRoute element={<AdminReservations />} />} />
      </Routes>
    </BrowserRouter>
  );
}
