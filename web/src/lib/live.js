// small wrapper (kept for backward compatibility)
import { liveConnect } from './routeApi.js';
export function subscribeBuses(cb) {
  return liveConnect((msg) => {
    try {
      // msg is object possibly like { event, data } or raw bus object
      if (!msg) return;
      if (msg.event === 'bus_update' && msg.data) cb(msg.data);
      else if (msg.bus_id) cb(msg); // raw bus object
    } catch (e) { console.warn('subscribeBuses error', e); }
  });
}
