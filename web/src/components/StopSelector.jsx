import React from "react";
export default function StopSelector({ stops, selectedStopId, setSelectedStopId }) {
  return (
    <div>
      <h3>Select Stop</h3>
      <div style={{ maxHeight: '40vh', overflow: 'auto' }} className="list">
        {stops.map((s) => (
          <button
            key={s.properties.stop_id}
            className={selectedStopId === s.properties.stop_id ? 'active' : ''}
            onClick={() => setSelectedStopId(s.properties.stop_id)}
          >
            {s.properties.name} ({s.properties.stop_id})
          </button>
        ))}
        {stops.length === 0 && <div className="small">No stops loaded yet.</div>}
      </div>
    </div>
  );
}
