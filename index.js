import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db.js";
import authrouter from "./auth.js";
import homerouter from "./home.js";
import livebusrouter from "./livebuses.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Core middleware
// --------------------
app.use(express.json());
app.use(express.static(__dirname));

// --------------------
// Ensure DB connection BEFORE routes
// --------------------
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Mongo connection failed:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// --------------------
// Session (required for passport)
// --------------------
app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// --------------------
// Passport
// --------------------
app.use(passport.initialize());
app.use(passport.session());

// --------------------
// Routes
// --------------------
app.use("/", authrouter);

app.get("/config", (req, res) => {
  res.json({
    MAPBOX_TOKEN: process.env.MY_TOKEN
  });
});

app.use("/home", homerouter);
app.use("/livebuses", livebusrouter);

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ REQUIRED FOR VERCEL
export default app;
