// twilio-webhooks.js – Twilio webhook routes for RaahiTrack
import express from "express";
import twilio from "twilio";

export function mountTwilioRoutes(app, { GTFS, buses, estimateETAMinutes }) {
  const router = express.Router();

  // Example SMS webhook endpoint
  router.post("/sms", express.urlencoded({ extended: false }), (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const body = (req.body.Body || "").trim().toLowerCase();

    if (body.startsWith("eta")) {
      const parts = body.split(/\s+/);
      if (parts.length >= 2) {
        const stopId = parts[1];
        const stop = GTFS.stopsById.get(stopId);

        if (stop) {
          const shape = GTFS.shapesById.values().next().value || [];
          const now = Date.now();

          let reply = "No active buses.";
          for (const bus of buses.values()) {
            if (now - bus.ts > 120000) continue; // stale
            const eta = estimateETAMinutes(bus, stop, shape, {
              defaultSpeedKmph: 18,
            });
            reply = `Bus ${bus.bus_id} ETA to stop ${stop.stop_name}: ${eta} min`;
            break;
          }

          twiml.message(reply);
          res.type("text/xml").send(twiml.toString());
          return;
        }
      }
    }

    twiml.message("Usage: ETA <stop_id>");
    res.type("text/xml").send(twiml.toString());
  });

  app.use("/twilio", router);
}
