import { Router } from "express";
import { uploadResume } from "../controllers/uploadController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/", protect, upload.single("resume"), asyncHandler(uploadResume));

export default router;
