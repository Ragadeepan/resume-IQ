import { Router } from "express";
import { z } from "zod";
import { getJobs } from "../controllers/jobsController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

const jobsQuerySchema = z.object({
  resumeId: z.string().uuid(),
  refresh: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true")
});

router.get("/", protect, validateRequest(jobsQuerySchema, "query"), asyncHandler(getJobs));

export default router;

