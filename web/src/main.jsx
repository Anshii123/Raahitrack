import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// small safety: show console message
console.log('RaahiTrack frontend starting...');

createRoot(document.getElementById('root')).render(<App />);
