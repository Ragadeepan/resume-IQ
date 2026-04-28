import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (payload, expiresIn = env.JWT_EXPIRES_IN) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn
  });

export const signAccessToken = (payload) => signToken(payload, env.ACCESS_TOKEN_EXPIRES_IN);
