import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import busrouter from "./registerbus.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use("/bus", busrouter);

router.get("/", (req, res) => {
  if (!req.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "homepage.html"));
});

export default router;
