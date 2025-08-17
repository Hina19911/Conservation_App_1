// A tiny network + auth utility.
// - Stores JWT token in memory (fast) and in localStorage (persistent).
// - Adds headers automatically.
// - Parses JSON responses automatically.

let token = localStorage.getItem('token') || null; // load once when the module is imported

// Update both the in-memory token and localStorage.
// Pass null to log out.
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

// Read current token (from memory).
export function getToken() {
  return token;
}

// Generic fetch wrapper:
// - Sets Content-Type: application/json by default
//   (but NOT when body is FormData, because the browser sets the boundary).
// - Adds Authorization: Bearer <token> when available.
// - Throws on non-2xx so callers can try/catch.
// - Auto-returns JSON or text based on response Content-Type.
export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  // Only set JSON header if body is NOT FormData (file uploads).
  const isFormData = options.body instanceof FormData;
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if logged in.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });

  // If response is not ok (e.g., 401/403/500), throw to let caller handle.
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || res.statusText);
  }

  // Smart parse based on Content-Type.
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
