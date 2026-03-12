// Upload API - Handle file uploads and create Media records
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const baseUploadDir = path.join(process.cwd(), "public", "uploads");

// Ensure all upload directories exist
const folders = ["general", "blog", "projects", "clients", "quotes"];
for (const folder of folders) {
  const dir = path.join(baseUploadDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseForm(req, uploadDir) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 20,
      filter: ({ mimetype }) => mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Parse to temp dir first, then move
    const tempDir = baseUploadDir;
    const { fields, files } = await parseForm(req, tempDir);

    // Get folder from form field (default: general)
    const folderRaw = Array.isArray(fields.folder)
      ? fields.folder[0]
      : fields.folder;
    const folder = folders.includes(folderRaw) ? folderRaw : "general";
    const targetDir = path.join(baseUploadDir, folder);

    const fileArray = files.file || [];
    const uploadedFiles = [];

    for (const file of Array.isArray(fileArray) ? fileArray : [fileArray]) {
      if (!file || !file.filepath) continue;

      const safeName = (file.originalFilename || "image.jpg").replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      // Strip multiple dots to prevent extension confusion
      const ext = path
        .extname(file.originalFilename || "image.jpg")
        .toLowerCase();
      const allowedExts = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".avif",
        ".svg",
      ];
      if (!allowedExts.includes(ext)) continue;
      const fileName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
      const newPath = path.join(targetDir, fileName);
      const url = `/uploads/${folder}/${fileName}`;

      fs.renameSync(file.filepath, newPath);

      // Create Media record in database
      const media = await prisma.media.create({
        data: {
          filename: fileName,
          originalName: file.originalFilename || fileName,
          mimeType: file.mimetype || "image/jpeg",
          size: file.size || 0,
          url,
          folder,
        },
      });

      uploadedFiles.push({
        id: media.id,
        name: media.originalName,
        url: media.url,
        size: media.size,
        type: media.mimeType,
        folder: media.folder,
      });
    }

    return res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload files" });
  }
}
