// Projects API - Get, Update, Delete by ID
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single project
  if (req.method === "GET") {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          client: true,
          images: { orderBy: { order: "asc" } },
          invoices: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.status(200).json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ error: "Failed to fetch project" });
    }
  }

  // PUT - Update project
  if (req.method === "PUT") {
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

      // Auto-set completedAt when status changes to COMPLETED
      let finalCompletedAt = completedAt ? new Date(completedAt) : null;
      if (status === "COMPLETED" && !completedAt) {
        const existing = await prisma.project.findUnique({
          where: { id },
          select: { completedAt: true, status: true },
        });
        if (
          existing &&
          existing.status !== "COMPLETED" &&
          !existing.completedAt
        ) {
          finalCompletedAt = new Date();
        }
      }

      // Handle images: delete old ones and recreate
      if (images !== undefined) {
        await prisma.projectImage.deleteMany({ where: { projectId: id } });
        if (images && images.length > 0) {
          // Validate image URLs are from our uploads
          const validImages = images.filter(
            (img) =>
              img.url &&
              (img.url.startsWith("/uploads/") ||
                img.url.startsWith("https://")),
          );
          if (validImages.length > 0) {
            await prisma.projectImage.createMany({
              data: validImages.map((img, i) => ({
                projectId: id,
                url: img.url,
                caption: img.caption ? String(img.caption).slice(0, 500) : null,
                order: i,
              })),
            });
          }
        }
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          title,
          description: description || null,
          clientId,
          category: category || null,
          location: location || null,
          status,
          startDate: startDate ? new Date(startDate) : null,
          estimatedEnd: estimatedEnd ? new Date(estimatedEnd) : null,
          completedAt: finalCompletedAt,
          value: value ? parseFloat(value) : null,
          actualCost: actualCost ? parseFloat(actualCost) : null,
          notes: notes || null,
          featured: featured || false,
        },
        include: {
          client: { select: { id: true, name: true } },
          images: { orderBy: { order: "asc" } },
        },
      });

      return res.status(200).json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.status(500).json({ error: "Failed to update project" });
    }
  }

  // DELETE - Delete project
  if (req.method === "DELETE") {
    try {
      await prisma.project.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.status(500).json({ error: "Failed to delete project" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
