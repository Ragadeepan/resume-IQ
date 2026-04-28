import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { signAccessToken } from "../utils/token.js";
import {
  clearActiveTokensForUser,
  consumeSingleUseToken,
  createEmailVerificationToken,
  createPasswordResetToken,
  createRefreshSessionToken,
  revokeAllRefreshSessionsForUser,
  revokeRefreshSession,
  rotateRefreshSession
} from "../utils/authTokens.js";
import { sendMail } from "../utils/mailer.js";

const selectUser = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  createdAt: true
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildVerificationUrl = (token) =>
  `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

const buildPasswordResetUrl = (token) =>
  `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

const createSessionPayload = async (user) => {
  const refreshToken = await createRefreshSessionToken(prisma, user.id);

  return {
    token: signAccessToken({ userId: user.id }),
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }
  };
};

const maybeAttachDebug = (payload, debug) =>
  env.NODE_ENV !== "production" && debug
    ? {
        ...payload,
        debug
      }
    : payload;

const sendVerificationEmail = async (user) => {
  await clearActiveTokensForUser(prisma, user.id, "EMAIL_VERIFICATION");
  const rawToken = await createEmailVerificationToken(prisma, user.id);
  const verificationUrl = buildVerificationUrl(rawToken);
  const mailResult = await sendMail({
    to: user.email,
    subject: "Verify your ResumeIQ account",
    html: `<p>Hello ${user.name},</p><p>Verify your ResumeIQ account by opening this link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
    text: `Hello ${user.name}, verify your ResumeIQ account here: ${verificationUrl}`,
    meta: {
      kind: "email-verification",
      verificationUrl
    }
  });

  return {
    verificationUrl,
    mail: mailResult
  };
};

const sendPasswordResetEmail = async (user) => {
  await clearActiveTokensForUser(prisma, user.id, "PASSWORD_RESET");
  const rawToken = await createPasswordResetToken(prisma, user.id);
  const resetUrl = buildPasswordResetUrl(rawToken);
  const mailResult = await sendMail({
    to: user.email,
    subject: "Reset your ResumeIQ password",
    html: `<p>Hello ${user.name},</p><p>Reset your ResumeIQ password by opening this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `Hello ${user.name}, reset your ResumeIQ password here: ${resetUrl}`,
    meta: {
      kind: "password-reset",
      resetUrl
    }
  });

  return {
    resetUrl,
    mail: mailResult
  };
};

export const register = async (req, res) => {
  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
    select: selectUser
  });

  const verification = await sendVerificationEmail(user);

  if (env.REQUIRE_EMAIL_VERIFICATION) {
    res.status(201).json(
      maybeAttachDebug(
        {
          message: "Account created. Please verify your email before signing in.",
          user,
          requiresEmailVerification: true
        },
        {
          verificationUrl: verification.verificationUrl,
          mailPreviewPath: verification.mail.previewPath || null
        }
      )
    );
    return;
  }

  const session = await createSessionPayload(user);

  res.status(201).json(
    maybeAttachDebug(
      {
        message: "Account created successfully",
        ...session
      },
      {
        verificationUrl: verification.verificationUrl,
        mailPreviewPath: verification.mail.previewPath || null
      }
    )
  );
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  if (env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerified) {
    const verification = await sendVerificationEmail(user);
    throw new HttpError(
      403,
      "Please verify your email before signing in.",
      env.NODE_ENV !== "production"
        ? {
            verificationUrl: verification.verificationUrl,
            mailPreviewPath: verification.mail.previewPath || null
          }
        : null
    );
  }

  const session = await createSessionPayload(user);

  res.json({
    message: "Logged in successfully",
    ...session
  });
};

export const refreshSession = async (req, res) => {
  const { refreshToken } = req.body;

  const rotatedSession = await rotateRefreshSession(prisma, refreshToken);
  const session = {
    token: signAccessToken({ userId: rotatedSession.user.id }),
    refreshToken: rotatedSession.refreshToken,
    user: {
      id: rotatedSession.user.id,
      name: rotatedSession.user.name,
      email: rotatedSession.user.email,
      emailVerified: rotatedSession.user.emailVerified,
      createdAt: rotatedSession.user.createdAt
    }
  };

  res.json({
    message: "Session refreshed successfully",
    ...session
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await revokeRefreshSession(prisma, refreshToken);
  }

  res.json({
    message: "Logged out successfully"
  });
};

export const logoutAllSessions = async (req, res) => {
  await revokeAllRefreshSessionsForUser(prisma, req.user.id);

  res.json({
    message: "All sessions have been revoked"
  });
};

export const verifyEmail = async (req, res) => {
  const user = await consumeSingleUseToken(prisma, req.body.token, "EMAIL_VERIFICATION");

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      emailVerified: true
    },
    select: selectUser
  });

  const session = await createSessionPayload(updatedUser);

  res.json({
    message: "Email verified successfully",
    ...session
  });
};

export const resendVerificationEmail = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: selectUser
  });

  if (!user) {
    res.json({
      message: "If that email exists, a new verification email has been sent."
    });
    return;
  }

  if (user.emailVerified) {
    res.json({
      message: "This email is already verified."
    });
    return;
  }

  const verification = await sendVerificationEmail(user);

  res.json(
    maybeAttachDebug(
      {
        message: "Verification email sent."
      },
      {
        verificationUrl: verification.verificationUrl,
        mailPreviewPath: verification.mail.previewPath || null
      }
    )
  );
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: selectUser
  });

  if (!user) {
    res.json({
      message: "If that email exists, a password reset link has been sent."
    });
    return;
  }

  const reset = await sendPasswordResetEmail(user);

  res.json(
    maybeAttachDebug(
      {
        message: "If that email exists, a password reset link has been sent."
      },
      {
        resetUrl: reset.resetUrl,
        mailPreviewPath: reset.mail.previewPath || null
      }
    )
  );
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await consumeSingleUseToken(prisma, token, "PASSWORD_RESET");
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: hashedPassword
    }
  });

  await revokeAllRefreshSessionsForUser(prisma, user.id);

  const updatedUser = await prisma.user.findUnique({
    where: {
      id: user.id
    },
    select: selectUser
  });

  const session = await createSessionPayload(updatedUser);

  res.json({
    message: "Password reset successfully",
    ...session
  });
};

export const getCurrentUser = async (req, res) => {
  res.json({
    user: req.user
  });
};
