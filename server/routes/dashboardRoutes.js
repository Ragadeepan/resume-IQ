import { Router } from "express";
import { z } from "zod";
import {
  getDashboard,
  getSharedReport,
  shareAnalysis
} from "../controllers/dashboardController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const dashboardQuerySchema = z.object({
  resumeId: z.string().uuid().optional()
});

const shareParamsSchema = z.object({
  analysisId: z.string().uuid()
});

const reportParamsSchema = z.object({
  shareToken: z.string().min(10)
});

router.get("/", protect, validateRequest(dashboardQuerySchema, "query"), asyncHandler(getDashboard));
router.post(
  "/share/:analysisId",
  protect,
  validateRequest(shareParamsSchema, "params"),
  asyncHandler(shareAnalysis)
);
router.get(
  "/report/:shareToken",
  validateRequest(reportParamsSchema, "params"),
  asyncHandler(getSharedReport)
);

export default router;
