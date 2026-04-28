import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mailPreviewDirectory = path.resolve(__dirname, "..", "..", "tmp", "mail");

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const smtpTransport = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null;

export const sendMail = async ({ to, subject, html, text, meta = {} }) => {
  if (smtpTransport) {
    const result = await smtpTransport.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text
    });

    return {
      delivery: "smtp",
      messageId: result.messageId
    };
  }

  await fs.mkdir(mailPreviewDirectory, { recursive: true });
  const fileName = `${Date.now()}-${to.replace(/[^a-z0-9@._-]+/gi, "_")}.json`;
  const filePath = path.join(mailPreviewDirectory, fileName);

  await fs.writeFile(
    filePath,
    JSON.stringify(
      {
        to,
        from: env.MAIL_FROM,
        subject,
        html,
        text,
        meta,
        createdAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  return {
    delivery: "file",
    previewPath: filePath
  };
};
