import { Router } from "express";
import Bus from "./BusSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/register", (req, res) => {
  if (!req.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "registrationpage.html"));
});

router.post("/register", async (req, res) => {
  try {
    const { busnumber, route } = req.body;

    let bus = await Bus.findOne({ driver: req.user._id });

    if (bus) {
      bus.busnumber = busnumber;
      bus.route = route;
      await bus.save();
    } else {
      bus = await Bus.create({
        driver: req.user._id,
        busnumber,
        route
      });
    }

    res.json({ success: true, bus });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
