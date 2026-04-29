import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";
import { localUploadsRoot } from "./utils/localFileStorage.js";

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(localUploadsRoot));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "resumeiq-api"
  });
});

app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/analyze", analysisRoutes);
app.use("/jobs", jobsRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ResumeIQ API listening on port ${PORT}`);
});
