// AdminReservations.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// apiFetch = your wrapper that auto adds JSON headers and the Authorization token (if set)
import { apiFetch } from '../api/client';
// logout() clears the token via setToken(null)
import { logout } from '../api/auth';

export default function AdminReservations() {
  // ====== STATE ======
  // List of reservations pulled from /api/reservations
  const [reservations, setReservations] = useState([]);
  // Show "Loading…" in the table while fetching
  const [loading, setLoading] = useState(false);
  // Shared form state used for both "Add" and "Edit" modes
  const [form, setForm] = useState({
    name: '', email: '', date: '', time: '', partySize: 1, notes: '', imageUrl: ''
  });
  // When not null, we are editing that reservation id (row switches to inputs)
  const [editingId, setEditingId] = useState(null);
  // File chosen in the "Add" section (for upload)
  const [file, setFile] = useState(null);
  // File chosen while editing a row (for upload)
  const [editFile, setEditFile] = useState(null);

  const navigate = useNavigate();

  // Small helper to (re)load the reservation list
  const load = async () => {
    setLoading(true);
    try {
      // GET /api/reservations (public GET is allowed by your server)
      const data = await apiFetch('/api/reservations');
      setReservations(data);
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on mount
  useEffect(() => { load(); }, []);

  // Generic text input handler for the shared form (Add/Edit)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Upload an image file to /upload and return the URL the server gives back
  const uploadImage = async (f) => {
    if (!f) return null;
    const fd = new FormData();
    fd.append('image', f);
    // Your /upload route is protected by authGuard (POST requires a token).
    // This call uses plain fetch(...), so there's NO Authorization header.
    // Option A (keep as-is IF your server allows /upload without token):
    const res = await fetch('/upload', { method: 'POST', body: fd });

    // Option B (recommended in admin area): use apiFetch so token is added.
    // const res = await apiFetch('/upload', { method: 'POST', body: fd });

    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url; // e.g., "/uploads/1699999999_photo.png"
  };

  // Handle "Add Reservation" submit
  const add = async (e) => {
    e.preventDefault();

    // If a file is chosen, upload to server first and get back an image URL
    let imageUrl = form.imageUrl;
    if (file) imageUrl = await uploadImage(file);

    // Build the body: ensure partySize is a number, not a string
    const body = {
      ...form,
      partySize: Number(form.partySize) || 1,
      imageUrl
    };

    // POST /api/reservations (protected write => token must be present)
    await apiFetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    // Reset the form and file input, then refresh the list
    setForm({ name: '', email: '', date: '', time: '', partySize: 1, notes: '', imageUrl: '' });
    setFile(null);
    await load();
  };

  // Clicking "Edit" pre-fills the shared form with that row's data
  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      email: r.email,
      date: r.date,
      time: r.time,
      partySize: String(r.partySize), // keep as string for the <input>
      notes: r.notes || '',
      imageUrl: r.imageUrl || ''
    });
    setEditFile(null);
  };

  // Save changes for the row currently being edited
  const saveEdit = async (id) => {
    // If a new file was picked for this row, upload and replace imageUrl
    let newUrl = form.imageUrl;
    if (editFile) newUrl = await uploadImage(editFile);

    const body = {
      ...form,
      partySize: Number(form.partySize) || 1,
      imageUrl: newUrl
    };

    // PUT replaces the entire resource in json-server (also fine to use PATCH)
    await apiFetch(`/api/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    // Exit edit mode, clear form, and refresh the list
    setEditingId(null);
    setForm({ name: '', email: '', date: '', time: '', partySize: 1, notes: '', imageUrl: '' });
    await load();
  };

  // Delete with a simple confirm prompt
  const remove = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    await apiFetch(`/api/reservations/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="container mt-4">
      {/* Header bar with shortcuts + logout */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0">Admin · Reservations</h2>
        <div className="d-flex gap-2">
          <Link to="/" className="btn btn-outline-secondary">Home</Link>
          <Link to="/reservations" className="btn btn-outline-secondary">Reservations</Link>
          <button
            className="btn btn-outline-danger"
            onClick={() => { logout(); navigate('/admin/login'); }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ====== ADD FORM (top card) ====== */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add Reservation</h5>

          {/* Bootstrap grid (row g-2) with inputs */}
          <form className="row g-2" onSubmit={add}>
            <div className="col-md-3">
              <input
                name="name"
                placeholder="Name"
                className="form-control"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-3">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="form-control"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-2">
              <input
                name="date"
                type="date"
                className="form-control"
                value={form.date}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-2">
              <input
                name="time"
                type="time"
                className="form-control"
                value={form.time}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-md-2">
              <input
                name="partySize"
                type="number"
                min="1"
                className="form-control"
                value={form.partySize}
                onChange={onChange}
                required
              />
            </div>

            <div className="col-12">
              <input
                name="notes"
                placeholder="Notes"
                className="form-control"
                value={form.notes}
                onChange={onChange}
              />
            </div>

            {/* Choose a file to upload ... */}
            <div className="col-md-6">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* ...or paste a direct image URL */}
            <div className="col-md-6">
              <input
                name="imageUrl"
                placeholder="Or paste image URL"
                className="form-control"
                value={form.imageUrl}
                onChange={onChange}
              />
            </div>

            <div className="col-12">
              <button className="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      </div>

      {/* ====== TABLE OF RESERVATIONS ====== */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Party</th>
              <th>Notes</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // While loading, show a single-row placeholder
              <tr><td colSpan="9">Loading…</td></tr>
            ) : (
              // Render each reservation as a table row
              reservations.map(r => (
                <tr key={r.id /* key helps React reconcile lists efficiently */}>
                  <td>{r.id}</td>

                  {/* Thumbnail cell */}
                  <td style={{ width: 90 }}>
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        style={{ width: 64, height: 64, objectFit: 'cover' }}
                      />
                    ) : (
                      <span className='text-muted'>—</span>
                    )}
                  </td>

                  {/* Name (switches to inputs in edit mode) */}
                  <td>
                    {editingId === r.id ? (
                      <div className="d-flex flex-column gap-1">
                        <input
                          name="name"
                          className="form-control form-control-sm"
                          value={form.name}
                          onChange={onChange}
                        />
                        <div className="d-flex gap-1">
                          <input
                            name="imageUrl"
                            placeholder="Image URL"
                            className="form-control form-control-sm"
                            value={form.imageUrl}
                            onChange={onChange}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control form-control-sm"
                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                    ) : (
                      r.name
                    )}
                  </td>

                  {/* Email */}
                  <td>
                    {editingId === r.id ? (
                      <input
                        name="email"
                        className="form-control form-control-sm"
                        value={form.email}
                        onChange={onChange}
                      />
                    ) : (
                      r.email
                    )}
                  </td>

                  {/* Date */}
                  <td>
                    {editingId === r.id ? (
                      <input
                        name="date"
                        type="date"
                        className="form-control form-control-sm"
                        value={form.date}
                        onChange={onChange}
                      />
                    ) : (
                      r.date
                    )}
                  </td>

                  {/* Time */}
                  <td>
                    {editingId === r.id ? (
                      <input
                        name="time"
                        type="time"
                        className="form-control form-control-sm"
                        value={form.time}
                        onChange={onChange}
                      />
                    ) : (
                      r.time
                    )}
                  </td>

                  {/* Party size */}
                  <td className="text-center">
                    {editingId === r.id ? (
                      <input
                        name="partySize"
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={form.partySize}
                        onChange={onChange}
                      />
                    ) : (
                      r.partySize
                    )}
                  </td>

                  {/* Notes (wide cell) */}
                  <td style={{ minWidth: 200 }}>
                    {editingId === r.id ? (
                      <input
                        name="notes"
                        className="form-control form-control-sm"
                        value={form.notes}
                        onChange={onChange}
                      />
                    ) : (
                      r.notes
                    )}
                  </td>

                  {/* Action buttons: Edit/Delete OR Save/Cancel */}
                  <td className="text-end">
                    {editingId === r.id ? (
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => saveEdit(r.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}

            {/* Empty state */}
            {(!loading && reservations.length === 0) && (
              <tr>
                <td colSpan="9">
                  <div className="alert alert-info m-0">No reservations yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
