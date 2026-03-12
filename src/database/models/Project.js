// Project model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";

/**
 * Create a new project
 */
export async function createProject(data) {
  const { images, ...projectData } = data;

  return prisma.project.create({
    data: {
      ...projectData,
      ...(images && {
        images: {
          create: images,
        },
      }),
    },
    include: {
      client: true,
      images: true,
    },
  });
}

/**
 * Get project by ID with related data
 */
export async function getProjectById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
      receipts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Get all projects with pagination and filters
 */
export async function getProjects({
  page = 1,
  limit = 10,
  status = null,
  clientId = null,
  search = "",
  isFeatured = null,
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(isFeatured !== null && { isFeatured }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ],
    }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true },
        },
        images: {
          take: 1,
          orderBy: { displayOrder: "asc" },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return buildPaginationResponse(projects, total, page, limit);
}

/**
 * Get featured projects for portfolio
 */
export async function getFeaturedProjects(limit = 6) {
  return prisma.project.findMany({
    where: {
      isFeatured: true,
      status: "COMPLETED",
    },
    take: limit,
    orderBy: { endDate: "desc" },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
}

/**
 * Update project
 */
export async function updateProject(id, data) {
  const { images, ...projectData } = data;

  return prisma.project.update({
    where: { id },
    data: projectData,
    include: {
      client: true,
      images: true,
    },
  });
}

/**
 * Delete project
 */
export async function deleteProject(id) {
  return prisma.project.delete({
    where: { id },
  });
}

/**
 * Add image to project
 */
export async function addProjectImage(projectId, imageData) {
  return prisma.projectImage.create({
    data: {
      ...imageData,
      projectId,
    },
  });
}

/**
 * Remove image from project
 */
export async function removeProjectImage(imageId) {
  return prisma.projectImage.delete({
    where: { id: imageId },
  });
}

/**
 * Update image order
 */
export async function updateImageOrder(images) {
  const updates = images.map((img, index) =>
    prisma.projectImage.update({
      where: { id: img.id },
      data: { displayOrder: index },
    }),
  );

  return prisma.$transaction(updates);
}

/**
 * Get project statistics
 */
export async function getProjectStats() {
  const [statusCounts, totalValue] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.project.aggregate({
      _sum: { totalCost: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  return {
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
    totalCompletedValue: totalValue._sum.totalCost || 0,
  };
}

/**
 * Get projects with before/after images for portfolio
 */
export async function getBeforeAfterProjects(limit = 10) {
  return prisma.project.findMany({
    where: {
      status: "COMPLETED",
      images: {
        some: {
          OR: [{ isBefore: true }, { isAfter: true }],
        },
      },
    },
    take: limit,
    include: {
      images: {
        where: {
          OR: [{ isBefore: true }, { isAfter: true }],
        },
        orderBy: { isBefore: "desc" },
      },
    },
  });
}

export default {
  createProject,
  getProjectById,
  getProjects,
  getFeaturedProjects,
  updateProject,
  deleteProject,
  addProjectImage,
  removeProjectImage,
  updateImageOrder,
  getProjectStats,
  getBeforeAfterProjects,
};
