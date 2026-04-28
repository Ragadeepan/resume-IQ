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
const allowedOrigins = new Set(
  [env.CLIENT_URL, ...env.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)].filter(
    Boolean
  )
);

if (env.NODE_ENV !== "production") {
  const clientUrl = new URL(env.CLIENT_URL);
  if (clientUrl.hostname === "localhost") {
    allowedOrigins.add(`${clientUrl.protocol}//127.0.0.1${clientUrl.port ? `:${clientUrl.port}` : ""}`);
  }
  if (clientUrl.hostname === "127.0.0.1") {
    allowedOrigins.add(`${clientUrl.protocol}//localhost${clientUrl.port ? `:${clientUrl.port}` : ""}`);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
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
