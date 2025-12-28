import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import authrouter from "./auth.js";
import homerouter from "./home.js";
import livebusrouter from "./livebuses.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// MongoDB connection (cached)
// --------------------
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.connect) {
    throw new Error("Missing MongoDB connection string (process.env.connect)");
  }

  await mongoose.connect(process.env.connect);
  isConnected = true;

  console.log("✅ MongoDB connected");
}

// --------------------
// Middlewares
// --------------------
app.use(express.json());
app.use(express.static(__dirname));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

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
// Health check (important for debugging)
// --------------------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ REQUIRED FOR VERCEL
export default app;
