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

app.use(express.json());
app.use(express.static(__dirname));

app.use(session({
  secret: process.env.MY_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.connect);
app.use("/", authrouter);
app.get("/config", (req, res) => {
  res.json({
    MAPBOX_TOKEN: process.env.MY_TOKEN
  });
});

app.use("/home", homerouter);
app.use("/livebuses", livebusrouter);



