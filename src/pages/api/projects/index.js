// Projects API - List and Create
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  // GET - List projects (public can see completed, admin sees all)
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      const {
        status,
        category,
        search,
        page = 1,
        limit = 20,
        publicOnly,
      } = req.query;

      const where = {};

      // Public requests only see completed projects
      if (!session || publicOnly === "true") {
        where.status = "COMPLETED";
      } else if (status) {
        where.status = status;
      }

      if (category) where.category = category;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          include: {
            client: session ? { select: { id: true, name: true } } : false,
            images: { orderBy: { order: "asc" } },
          },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.project.count({ where }),
      ]);

      return res.status(200).json({
        projects,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // POST - Create new project
  if (req.method === "POST") {
    try {
      const {
        title,
        description,
        clientId,
        category,
        location,
        status,
        startDate,
        estimatedEnd,
        completedAt,
        value,
        actualCost,
        notes,
        featured,
        images,
      } = req.body;

      if (!title || !clientId) {
        return res.status(400).json({ error: "Title and client are required" });
      }

      const project = await prisma.project.create({
        data: {
          title,
          description: description || null,
          clientId,
          category: category || null,
          location: location || null,
          status: status || "PLANNING",
          startDate: startDate ? new Date(startDate) : null,
          estimatedEnd: estimatedEnd ? new Date(estimatedEnd) : null,
          completedAt: completedAt ? new Date(completedAt) : null,
          value: value ? parseFloat(value) : null,
          actualCost: actualCost ? parseFloat(actualCost) : null,
          notes: notes || null,
          featured: featured || false,
          ...(images && images.length > 0
            ? {
                images: {
                  create: images
                    .filter(
                      (img) =>
                        img.url &&
                        (img.url.startsWith("/uploads/") ||
                          img.url.startsWith("https://")),
                    )
                    .map((img, i) => ({
                      url: img.url,
                      caption: img.caption
                        ? String(img.caption).slice(0, 500)
                        : null,
                      order: i,
                    })),
                },
              }
            : {}),
        },
        include: {
          client: { select: { id: true, name: true } },
          images: { orderBy: { order: "asc" } },
        },
      });

      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({
        error: "Failed to create project",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
