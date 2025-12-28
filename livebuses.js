import { Router } from "express";
import Bus from "./BusSchema.js";
import LiveBus from "./liveBusesSchema.js";

const router = Router();

/* ======================
   HAVERSINE DISTANCE (KM)
   ====================== */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ======================
   ON ROUTE (DRIVER GOES LIVE)
   ====================== */
router.put("/", async (req, res) => {
  if (!req.user) return res.sendStatus(401);

  await LiveBus.findOneAndUpdate(
    { driverId: req.user._id },
    { driverId: req.user._id },
    { upsert: true }
  );

  res.json({ success: true });
});

/* ======================
   OFF ROUTE (DRIVER GOES OFFLINE)
   ====================== */
router.delete("/", async (req, res) => {
  if (!req.user) return res.sendStatus(401);

  await LiveBus.deleteOne({ driverId: req.user._id });
  res.json({ success: true });
});

/* ======================
   UPDATE LIVE LOCATION (EVERY 10s)
   ====================== */
router.put("/location", async (req, res) => {
  const { driverId, lat, lng } = req.body;

  const bus = await LiveBus.findOne({ driverId });
  if (!bus) return res.json({ ignored: true });

  await LiveBus.findOneAndUpdate(
    { driverId },
    {
      lastlat: bus.lat ?? null,
      lastlng: bus.lng ?? null,
      lat,
      lng
    }
  );

  res.json({ updated: true });
});

/* ======================
   GET LIVE BUSES (FRONTEND POLLING)
   ====================== */
router.get("/", async (req, res) => {
  const buses = await LiveBus.find(
    {},
    { _id: 0, lat: 1, lng: 1, lastlat: 1, lastlng: 1 }
  );

  res.json(buses);
});

/* ======================
   SEARCH LIVE BUSES
   ====================== */
router.post("/", async (req, res) => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    return res.json({ routes: [] });
  }

  const SNAP_DISTANCE_KM = 5;
  const liveDrivers = await LiveBus.find();
  const routes = [];

  for (const live of liveDrivers) {
    const bus = await Bus.findOne({ driver: live.driverId });
    if (!bus || !Array.isArray(bus.route) || bus.route.length < 2) continue;

    let srcIdx = -1;
    let dstIdx = -1;
    let minSrcDist = Infinity;
    let minDstDist = Infinity;

    bus.route.forEach((p, i) => {
      const dSrc = distanceKm(
        source.lat,
        source.lng,
        p.latitude,
        p.longitude
      );
      if (dSrc < minSrcDist) {
        minSrcDist = dSrc;
        srcIdx = i;
      }

      const dDst = distanceKm(
        destination.lat,
        destination.lng,
        p.latitude,
        p.longitude
      );
      if (dDst < minDstDist) {
        minDstDist = dDst;
        dstIdx = i;
      }
    });

    if (
      srcIdx === -1 ||
      dstIdx === -1 ||
      minSrcDist > SNAP_DISTANCE_KM ||
      minDstDist > SNAP_DISTANCE_KM ||
      dstIdx <= srcIdx
    ) {
      continue;
    }

    const subRoute = bus.route.slice(srcIdx, dstIdx + 1);

    routes.push({
      busNumber: bus.busnumber,

      fullRoute: {
        coordinates: bus.route.map(p => [p.longitude, p.latitude]),
        stops: bus.route.map(p => p.name)
      },

      subRoute: {
        coordinates: subRoute.map(p => [p.longitude, p.latitude]),
        stops: subRoute.map(p => p.name)
      }
    });

    if (routes.length === 3) break;
  }

  res.json({ routes });
});

export default router;
