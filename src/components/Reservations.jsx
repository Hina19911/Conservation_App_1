import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
//  apiFetch for server calls
import { apiFetch } from '../api/client';
import MapView from './MapView';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buy Ticket modal state
  const [showBuy, setShowBuy] = useState(false);
  const [selected, setSelected] = useState(null); // the reservation user is buying for
  const [ticket, setTicket] = useState({ name: '', email: '', quantity: 1 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/reservations')
      .then(r => r.json())
      .then(setReservations)
      .finally(() => setLoading(false));
  }, []);

  function openBuy(resv) {
    setSelected(resv);
    // prefill buyer name/email from the reservation (user can change)
    setTicket({ name: resv.name || '', email: resv.email || '', quantity: 1 });
    setShowBuy(true);
    setMessage('');
  }

  function closeBuy() {
    setShowBuy(false);
    setSelected(null);
  }

  function onTicketChange(e) {
    const { name, value } = e.target;
    setTicket(prev => ({ ...prev, [name]: name === 'quantity' ? value.replace(/\D/g, '') : value }));
  }

  // ✅ Redirect to Stripe Checkout instead of in-app "purchase"
  async function submitTicket(e) {
    e.preventDefault();
    if (!selected) return;

    const payload = {
      reservationId: selected.id,
      name: ticket.name.trim(),
      email: ticket.email.trim(),
      quantity: Math.max(1, Number(ticket.quantity) || 1),
    };

    try {
      // Ask backend to create a Checkout Session
      const { url } = await apiFetch('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!url) {
        setMessage('❌ Could not start checkout. Check the server logs.');
        closeBuy();
        return;
      }
      // Go to Stripe's hosted payment page
      window.location.assign(url);
    } catch (err) {
      setMessage(`❌ Checkout failed: ${err.message || 'Unknown error'}`);
      closeBuy();
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0">Reservations</h2>
        <Link to="/admin/login" className="btn btn-outline-secondary">Admin</Link>
      </div>

      {/* Public page map */}
      <MapView />

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : reservations.length === 0 ? (
        <div className="alert alert-info">No reservations found.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {reservations.map(r => (
            <div key={r.id} className="col">
              <div className="card h-100">
                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    className="card-img-top"
                    alt={r.name}
                    style={{ objectFit: 'cover', height: 160 }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-1">{r.name}</h5>
                  <div className="text-muted small mb-2">{r.email}</div>
                  <div className="mb-2">
                    <strong>{r.date}</strong> at <strong>{r.time}</strong>
                  </div>
                  <div className="mb-3">Party size: {r.partySize}</div>
                  {r.notes && <p className="card-text mb-3">{r.notes}</p>}

                  <div className="mt-auto">
                    <button className="btn btn-primary w-100" onClick={() => openBuy(r)}>
                      Buy Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Buy Ticket Modal (React-controlled) ===== */}
      {showBuy && selected && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ background: 'rgba(0,0,0,.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Buy Ticket – {selected.name}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeBuy}></button>
              </div>

              <form onSubmit={submitTicket}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="buyerName">Your Name</label>
                    <input
                      id="buyerName"
                      className="form-control"
                      name="name"
                      value={ticket.name}
                      onChange={onTicketChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="buyerEmail">Email</label>
                    <input
                      id="buyerEmail"
                      className="form-control"
                      type="email"
                      name="email"
                      value={ticket.email}
                      onChange={onTicketChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="qty">Quantity</label>
                    <input
                      id="qty"
                      className="form-control"
                      type="number"
                      min="1"
                      name="quantity"
                      value={ticket.quantity}
                      onChange={onTicketChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeBuy}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Pay & Confirm</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
