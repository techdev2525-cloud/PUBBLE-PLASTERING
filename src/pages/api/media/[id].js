// Media Item API - Get, Update, Delete
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single media item
  if (req.method === "GET") {
    try {
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      return res.status(200).json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      return res.status(500).json({ error: "Failed to fetch media" });
    }
  }

  // PUT - Update media metadata (alt text, folder)
  if (req.method === "PUT") {
    try {
      const { altText, folder } = req.body;
      const data = {};
      if (altText !== undefined) data.altText = altText;
      if (folder !== undefined) data.folder = folder;

      const media = await prisma.media.update({
        where: { id },
        data,
      });
      return res.status(200).json(media);
    } catch (error) {
      console.error("Error updating media:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Media not found" });
      }
      return res.status(500).json({ error: "Failed to update media" });
    }
  }

  // DELETE - Remove media record and file
  if (req.method === "DELETE") {
    try {
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }

      // Try to delete the physical file (with path traversal protection)
      const filePath = path.join(process.cwd(), "public", media.url);
      const uploadsDir = path.resolve(
        path.join(process.cwd(), "public", "uploads"),
      );
      const resolvedPath = path.resolve(filePath);
      try {
        if (
          resolvedPath.startsWith(uploadsDir) &&
          fs.existsSync(resolvedPath)
        ) {
          fs.unlinkSync(resolvedPath);
        }
      } catch (fsError) {
        console.warn("Could not delete file");
      }

      await prisma.media.delete({ where: { id } });

      return res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      return res.status(500).json({ error: "Failed to delete media" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
