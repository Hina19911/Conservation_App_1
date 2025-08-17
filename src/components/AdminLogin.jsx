// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// apiFetch: your wrapper that auto-sets headers & parses JSON
import { apiFetch } from '../api/client';
// setToken: saves the JWT to memory + localStorage
import { setToken } from '../api/auth';

export default function AdminLogin() {
  // React state for controlled inputs + error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState(null);

  // From React Router: lets us programmatically change the URL
  const navigate = useNavigate();

  // Form submit handler
  const submit = async (e) => {
    e.preventDefault();      // stop the browser's full-page POST
    setError(null);          // clear any previous error

    try {
      // Call backend /login with JSON body
      // apiFetch returns JSON -> { token }
      const { token } = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Store the token so future requests include Authorization: Bearer <token>
      setToken(token);

      // Go to the admin page (SPA navigation, no reload)
      navigate('/admin/reservations');
    } catch {
      // If /login returned 401 or failed, show a friendly message
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">Admin Sign In</h2>

      {/* onSubmit wires the form to our submit() handler */}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">Username</label>
          {/* Controlled input: value comes from state, onChange updates state */}
          <input
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {/* Only render the alert if error has a value */}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Submit button triggers onSubmit on the <form> */}
        <button className="btn btn-primary w-100">Sign In</button>
      </form>

      <div className="mt-3 text-muted small">
        Default: <code>admin / admin123</code>
      </div>
    </div>
  );
}
