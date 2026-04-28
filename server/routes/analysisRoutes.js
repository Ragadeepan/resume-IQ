import { Router } from "express";
import { z } from "zod";
import { analyzeResume } from "../controllers/analysisController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const analyzeSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().max(12000).optional().default("")
});

router.post("/", protect, validateRequest(analyzeSchema), asyncHandler(analyzeResume));

export default router;

