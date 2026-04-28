import { Router } from "express";
import { z } from "zod";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  logoutAllSessions,
  refreshSession,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail
} from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

const emailSchema = z.object({
  email: z.string().email()
});

const verifySchema = z.object({
  token: z.string().min(20)
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100)
});

router.post("/register", validateRequest(registerSchema), asyncHandler(register));
router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.post("/refresh", validateRequest(refreshSchema), asyncHandler(refreshSession));
router.post("/logout", validateRequest(refreshSchema), asyncHandler(logout));
router.post("/logout-all", protect, asyncHandler(logoutAllSessions));
router.post("/verify-email", validateRequest(verifySchema), asyncHandler(verifyEmail));
router.post(
  "/resend-verification",
  validateRequest(emailSchema),
  asyncHandler(resendVerificationEmail)
);
router.post("/forgot-password", validateRequest(emailSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validateRequest(resetPasswordSchema), asyncHandler(resetPassword));
router.get("/me", protect, asyncHandler(getCurrentUser));

export default router;
