import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { slugify } from "./text.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "..", "uploads", "resumes");

export const localUploadsRoot = path.resolve(__dirname, "..", "uploads");

export const saveResumeLocally = async (file) => {
  await fs.mkdir(uploadsDirectory, { recursive: true });

  const extension = path.extname(file.originalname) || ".bin";
  const baseName = slugify(path.basename(file.originalname, extension)) || "resume";
  const fileName = `${Date.now()}-${baseName}${extension}`;
  const absolutePath = path.join(uploadsDirectory, fileName);

  await fs.writeFile(absolutePath, file.buffer);

  return {
    absolutePath,
    relativeUrl: `/uploads/resumes/${fileName}`,
    fileUrl: `${env.SERVER_URL}/uploads/resumes/${fileName}`
  };
};
