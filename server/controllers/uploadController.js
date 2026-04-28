import { prisma } from "../utils/prisma.js";
import { hasCloudinaryConfig } from "../utils/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { saveResumeLocally } from "../utils/localFileStorage.js";
import { extractResumeText, parseResumeText } from "../utils/resumeParser.js";
import { HttpError } from "../utils/httpError.js";
import { formatResume } from "../utils/responseShapes.js";

export const uploadResume = async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, "Resume file is required");
  }

  const rawText = await extractResumeText(req.file);
  const parsedData = parseResumeText(rawText);

  let fileUrl = `unconfigured://cloudinary/${encodeURIComponent(req.file.originalname)}`;
  let cloudinaryPublicId = null;
  let warning = null;

  if (hasCloudinaryConfig) {
    const uploadResult = await uploadToCloudinary(req.file);
    fileUrl = uploadResult.secure_url;
    cloudinaryPublicId = uploadResult.public_id;
  } else {
    const localFile = await saveResumeLocally(req.file);
    fileUrl = localFile.fileUrl;
    warning =
      "Cloudinary is not configured. ResumeIQ stored the file locally for development use instead.";
  }

  const resume = await prisma.resume.create({
    data: {
      userId: req.user.id,
      fileUrl,
      cloudinaryPublicId,
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype,
      rawText,
      parsedData
    }
  });

  res.status(201).json({
    message: "Resume uploaded successfully",
    warning,
    resume: formatResume(resume)
  });
};
