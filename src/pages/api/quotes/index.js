// Quote Requests API - Public submission and admin list
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { sendQuoteNotification, sendQuoteConfirmation } from "@/lib/email";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const isVercel = process.env.VERCEL === "1";
const quoteUploadDir = isVercel
  ? "/tmp/uploads/quotes"
  : path.join(process.cwd(), "public", "uploads", "quotes");
if (!fs.existsSync(quoteUploadDir)) {
  fs.mkdirSync(quoteUploadDir, { recursive: true });
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: quoteUploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 5,
      filter: ({ mimetype }) => mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function getField(fields, key) {
  const v = fields[key];
  if (Array.isArray(v)) return v[0] || "";
  return v || "";
}

export default async function handler(req, res) {
  // POST - Public quote submission (no auth required)
  if (req.method === "POST") {
    try {
      const { fields, files } = await parseForm(req);

      const name = getField(fields, "name");
      const email = getField(fields, "email");
      const phone = getField(fields, "phone");
      const address = getField(fields, "address");
      const postcode = getField(fields, "postcode");
      const service =
        getField(fields, "serviceType") || getField(fields, "service");
      const message =
        getField(fields, "projectDescription") || getField(fields, "message");
      const timeline = getField(fields, "timeline");
      const budget = getField(fields, "budget");
      const preferredContact = getField(fields, "preferredContact");

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ error: "Name, email, and project description are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 254) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      if (name.length > 200 || message.length > 5000) {
        return res.status(400).json({ error: "Input exceeds maximum length" });
      }

      // Process uploaded images
      const imageFiles = files.images || [];
      const fileArr = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      const imagePaths = [];
      for (const file of fileArr) {
        if (file && file.filepath) {
          const safeName = (file.originalFilename || "image.jpg").replace(
            /[^a-zA-Z0-9_-]/g,
            "_",
          );
          const ext = path
            .extname(file.originalFilename || "image.jpg")
            .toLowerCase();
          const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
          if (!allowedExts.includes(ext)) continue;
          const fileName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
          const newPath = path.join(quoteUploadDir, fileName);
          fs.renameSync(file.filepath, newPath);
          imagePaths.push(`/uploads/quotes/${fileName}`);
        }
      }

      const quoteRequest = await prisma.quoteRequest.create({
        data: {
          name,
          email,
          phone: phone || null,
          address: address || null,
          postcode: postcode || null,
          service: service || null,
          message,
          timeline: timeline || null,
          budget: budget || null,
          preferredContact: preferredContact || null,
          images: imagePaths.length > 0 ? JSON.stringify(imagePaths) : null,
          status: "NEW",
        },
      });

      // Create in-app notification
      await prisma.notification
        .create({
          data: {
            type: "QUOTE_REQUEST",
            title: `New quote request from ${name}`,
            message: service
              ? `Service: ${service} — ${message.slice(0, 80)}`
              : message.slice(0, 100),
            link: "/admin/quote-requests",
          },
        })
        .catch(console.error);

      // Send notification email to admin (non-blocking)
      sendQuoteNotification(quoteRequest).catch(console.error);
      // Send confirmation email to customer (non-blocking)
      sendQuoteConfirmation(quoteRequest).catch(console.error);

      return res.status(201).json({
        message: "Quote request submitted successfully",
        id: quoteRequest.id,
      });
    } catch (error) {
      console.error("Error creating quote request:", error);
      return res.status(500).json({ error: "Failed to submit quote request" });
    }
  }

  // GET - Admin only: List all quote requests
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const status = url.searchParams.get("status");
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 50;

      const where = status ? { status } : {};

      const [requests, total] = await Promise.all([
        prisma.quoteRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.quoteRequest.count({ where }),
      ]);

      return res.status(200).json({
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      return res.status(500).json({ error: "Failed to fetch quote requests" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
