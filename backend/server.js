import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import api from "./routes/api.js";

const isProduction = process.env.NODE_ENV === "production";
const missingEnvironment = ["MONGODB_URI", "JWT_SECRET"].filter(name => !process.env[name]);
if (isProduction && !process.env.CLIENT_URL) missingEnvironment.push("CLIENT_URL");
if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
}
if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

const app = express();
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin =
      process.env.NODE_ENV !== "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    const error = new Error("Origin is not allowed by CORS");
    error.status = 403;
    return callback(error);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 150 }), api);
app.use((error, req, res, next) => {
  const status = error.status
    || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 0)
    || (error.code === "LIMIT_FILE_SIZE" ? 413 : 0)
    || (String(error.code || "").startsWith("LIMIT_") ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? "Unexpected server error" : error.message });
});

const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((error) => { console.error("Could not start API:", error.message); process.exit(1); });
