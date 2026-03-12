// Media API - List and Delete media files
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - List all media
  if (req.method === "GET") {
    try {
      const { folder, search, page = 1, limit = 50 } = req.query;

      const where = {
        ...(folder && { folder }),
        ...(search && {
          OR: [
            { filename: { contains: search } },
            { originalName: { contains: search } },
            { altText: { contains: search } },
          ],
        }),
      };

      const [media, total] = await Promise.all([
        prisma.media.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.media.count({ where }),
      ]);

      return res.status(200).json({
        media,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching media:", error);
      return res.status(500).json({ error: "Failed to fetch media" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
