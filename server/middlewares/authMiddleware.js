import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Authentication token is missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, emailVerified: true, createdAt: true }
    });

    if (!user) {
      throw new HttpError(401, "User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    next(new HttpError(401, "Invalid or expired token"));
  }
});
