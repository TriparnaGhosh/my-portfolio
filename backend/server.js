import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./config/db.js";
import api from "./routes/api.js";

const app = express();
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5174")
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
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 150 }), api);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Unexpected server error" });
});

const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((error) => { console.error("Could not start API:", error.message); process.exit(1); });
