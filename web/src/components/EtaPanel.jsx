import React from "react";
export default function EtaPanel({ eta, lastUpdated }) {
  return (
    <div style={{ marginTop: 12 }}>
      <h3>Upcoming</h3>
      {!eta || !eta.upcoming || eta.upcoming.length === 0 ? (
        <div className="small">No live buses for this stop.</div>
      ) : (
        <div className="list">
          {eta.upcoming.map((x) => (
            <div key={x.bus_id} style={{ padding: 8, border: '1px solid #eee', borderRadius: 8 }}>
              <strong>{x.bus_id}</strong> — {x.eta_min} min
            </div>
          ))}
        </div>
      )}
      <div className="small" style={{ marginTop: 8 }}>
        Last: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
      </div>
    </div>
  );
}
