import React from "react";
export default function Header({ lite, setLite }) {
  return (
    <header>
      <h1>RaahiTrack</h1>
      <div style={{ marginLeft: 12 }}>
        <button className={lite ? 'active' : ''} onClick={() => setLite(!lite)}>
          {lite ? 'Lite Mode ON' : 'Enable Lite Mode'}
        </button>
      </div>
      <div style={{ marginLeft: 'auto' }} className="small">Low-bandwidth friendly</div>
    </header>
  );
}
