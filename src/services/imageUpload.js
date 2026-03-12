// Image Upload Service
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database";
import { siteSettings } from "../config/siteSettings";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directories exist
async function ensureUploadDirs() {
  const dirs = ["blog", "projects", "clients", "general", "quotes"];
  for (const dir of dirs) {
    const fullPath = path.join(UPLOAD_DIR, dir);
    await fs.mkdir(fullPath, { recursive: true });
  }
}

/**
 * Validate uploaded file
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = siteSettings.uploads.maxFileSizeMB * 1024 * 1024,
    allowedTypes = siteSettings.uploads.allowedImageTypes,
  } = options;

  const errors = [];

  if (file.size > maxSize) {
    errors.push(
      `File size exceeds ${siteSettings.uploads.maxFileSizeMB}MB limit`,
    );
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process and save uploaded image
 */
export async function uploadImage(file, options = {}) {
  const {
    folder = "general",
    resize = true,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    generateThumbnail = true,
    thumbnailSize = 300,
  } = options;

  await ensureUploadDirs();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.errors.join(", "));
  }

  // Generate unique filename
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${uuidv4()}${ext}`;
  const webpFilename = `${path.basename(filename, ext)}.webp`;
  const thumbnailFilename = `${path.basename(filename, ext)}_thumb.webp`;

  const uploadPath = path.join(UPLOAD_DIR, folder);
  const filePath = path.join(uploadPath, webpFilename);
  const thumbnailPath = path.join(uploadPath, thumbnailFilename);

  // Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Process image with sharp
  let image = sharp(buffer);
  const metadata = await image.metadata();

  // Resize if needed
  if (resize && (metadata.width > maxWidth || metadata.height > maxHeight)) {
    image = image.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to WebP and save
  await image.webp({ quality }).toFile(filePath);

  // Generate thumbnail
  let thumbnailUrl = null;
  if (generateThumbnail) {
    await sharp(buffer)
      .resize(thumbnailSize, thumbnailSize, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    thumbnailUrl = `/uploads/${folder}/${thumbnailFilename}`;
  }

  // Get file stats
  const stats = await fs.stat(filePath);

  // Save to database
  const media = await prisma.media.create({
    data: {
      filename: webpFilename,
      originalName: file.name,
      mimeType: "image/webp",
      size: stats.size,
      url: `/uploads/${folder}/${webpFilename}`,
      folder,
    },
  });

  return {
    id: media.id,
    url: media.url,
    thumbnailUrl,
    filename: webpFilename,
    originalName: file.name,
    size: stats.size,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Upload multiple images
 */
export async function uploadImages(files, options = {}) {
  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      const result = await uploadImage(file, options);
      results.push(result);
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }

  return { results, errors };
}

/**
 * Delete image
 */
export async function deleteImage(id) {
  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    throw new Error("Image not found");
  }

  // Delete physical files
  const filePath = path.join(process.cwd(), "public", media.url);
  const thumbPath = filePath.replace(".webp", "_thumb.webp");

  try {
    await fs.unlink(filePath);
  } catch (e) {
    console.warn("Could not delete main image file:", e.message);
  }

  try {
    await fs.unlink(thumbPath);
  } catch (e) {
    // Thumbnail might not exist
  }

  // Delete from database
  await prisma.media.delete({
    where: { id },
  });

  return { success: true };
}

/**
 * Get all media with pagination
 */
export async function getMedia({ page = 1, limit = 20, folder = null }) {
  const skip = (page - 1) * limit;

  const where = folder ? { folder } : {};

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.count({ where }),
  ]);

  return {
    items: media,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Optimize existing image
 */
export async function optimizeImage(imagePath, options = {}) {
  const { quality = 85, maxWidth = 1920 } = options;

  const fullPath = path.join(process.cwd(), "public", imagePath);
  const buffer = await fs.readFile(fullPath);

  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (metadata.width > maxWidth) {
    image.resize(maxWidth, null, { withoutEnlargement: true });
  }

  const outputPath = fullPath.replace(/\.[^.]+$/, ".webp");

  await image.webp({ quality }).toFile(outputPath);

  return {
    original: imagePath,
    optimized: outputPath.replace(path.join(process.cwd(), "public"), ""),
    originalSize: buffer.length,
    optimizedSize: (await fs.stat(outputPath)).size,
  };
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(imagePath) {
  const fullPath = path.join(process.cwd(), "public", imagePath);
  const metadata = await sharp(fullPath).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  };
}

/**
 * Create image variants (for responsive images)
 */
export async function createImageVariants(
  imagePath,
  sizes = [640, 768, 1024, 1280, 1920],
) {
  const fullPath = path.join(process.cwd(), "public", imagePath);
  const buffer = await fs.readFile(fullPath);
  const dir = path.dirname(fullPath);
  const basename = path.basename(imagePath, path.extname(imagePath));

  const variants = [];

  for (const width of sizes) {
    const variantFilename = `${basename}_${width}w.webp`;
    const variantPath = path.join(dir, variantFilename);

    await sharp(buffer)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(variantPath);

    const stats = await fs.stat(variantPath);

    variants.push({
      width,
      path: variantPath.replace(path.join(process.cwd(), "public"), ""),
      size: stats.size,
    });
  }

  return variants;
}

export default {
  validateFile,
  uploadImage,
  uploadImages,
  deleteImage,
  getMedia,
  optimizeImage,
  getImageDimensions,
  createImageVariants,
};
