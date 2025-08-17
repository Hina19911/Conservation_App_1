// Small auth facade over the client utilities.
// - Export isAuthed() for guards.
// - Export logout() to clear token.
// - Re-export setToken/getToken for convenience.

import { setToken, getToken } from './client';

// True if we have any token.
export function isAuthed() {
  return !!getToken();
}

// Clear token (log out).
export function logout() {
  setToken(null);
}

// Optional: simple login helper that hits your /login endpoint.
// (You can keep using your separate file if you prefer.)
export async function login(username, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }
  const { token } = await res.json();
  setToken(token); // store for future requests
  return token;
}

// Re-export for convenience so other modules can do:
// import { setToken, getToken } from '../api/auth';
export { setToken, getToken };