import { createHash, randomBytes } from "crypto";
import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const hashToken = (token) =>
  createHash("sha256")
    .update(token)
    .digest("hex");

const createRawToken = () => randomBytes(32).toString("hex");

const addDuration = (date, { minutes = 0, hours = 0, days = 0 } = {}) =>
  new Date(date.getTime() + minutes * 60000 + hours * 3600000 + days * 86400000);

export const createPersistedToken = async (db, { userId, type, expiresAt }) => {
  const rawToken = createRawToken();
  const tokenHash = hashToken(rawToken);

  await db.authToken.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt
    }
  });

  return rawToken;
};

export const createEmailVerificationToken = async (db, userId) =>
  createPersistedToken(db, {
    userId,
    type: "EMAIL_VERIFICATION",
    expiresAt: addDuration(new Date(), {
      hours: env.EMAIL_VERIFICATION_EXPIRES_HOURS
    })
  });

export const createPasswordResetToken = async (db, userId) =>
  createPersistedToken(db, {
    userId,
    type: "PASSWORD_RESET",
    expiresAt: addDuration(new Date(), {
      minutes: env.PASSWORD_RESET_EXPIRES_MINUTES
    })
  });

export const createRefreshSessionToken = async (db, userId) =>
  createPersistedToken(db, {
    userId,
    type: "REFRESH_SESSION",
    expiresAt: addDuration(new Date(), {
      days: env.REFRESH_TOKEN_EXPIRES_DAYS
    })
  });

export const consumeSingleUseToken = async (db, rawToken, type) => {
  const tokenRecord = await db.authToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      type,
      usedAt: null,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!tokenRecord) {
    throw new HttpError(400, "Token is invalid or has expired");
  }

  await db.authToken.update({
    where: {
      id: tokenRecord.id
    },
    data: {
      usedAt: new Date()
    }
  });

  return tokenRecord.user;
};

export const getRefreshSession = async (db, rawToken) => {
  const tokenRecord = await db.authToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      type: "REFRESH_SESSION",
      usedAt: null,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!tokenRecord) {
    throw new HttpError(401, "Refresh session is invalid or has expired");
  }

  return tokenRecord;
};

export const revokeRefreshSession = async (db, rawToken) => {
  const tokenHash = hashToken(rawToken);

  await db.authToken.updateMany({
    where: {
      tokenHash,
      type: "REFRESH_SESSION",
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export const rotateRefreshSession = async (db, rawToken) => {
  const existingSession = await getRefreshSession(db, rawToken);

  await db.authToken.update({
    where: { id: existingSession.id },
    data: {
      revokedAt: new Date()
    }
  });

  const nextRefreshToken = await createRefreshSessionToken(db, existingSession.userId);

  return {
    user: existingSession.user,
    refreshToken: nextRefreshToken
  };
};

export const revokeAllRefreshSessionsForUser = async (db, userId) => {
  await db.authToken.updateMany({
    where: {
      userId,
      type: "REFRESH_SESSION",
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export const clearActiveTokensForUser = async (db, userId, type) => {
  await db.authToken.updateMany({
    where: {
      userId,
      type,
      usedAt: null,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};
