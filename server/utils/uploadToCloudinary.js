import { cloudinaryClient, hasCloudinaryConfig } from "./cloudinary.js";
import { HttpError } from "./httpError.js";
import { slugify } from "./text.js";

export const uploadToCloudinary = (file, folder = "resumeiq/resumes") =>
  new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig) {
      reject(new HttpError(500, "Cloudinary is not configured"));
      return;
    }

    const uploadStream = cloudinaryClient.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: `${slugify(file.originalname.replace(/\.[^.]+$/, ""))}-${Date.now()}`
      },
      (error, result) => {
        if (error) {
          reject(new HttpError(502, "Cloudinary upload failed", error));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });

