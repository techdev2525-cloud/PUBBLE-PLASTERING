// QuoteRequest model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";

/**
 * Create a new quote request
 */
export async function createQuoteRequest(data) {
  return prisma.quoteRequest.create({
    data,
  });
}

/**
 * Get quote request by ID
 */
export async function getQuoteRequestById(id) {
  return prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });
}

/**
 * Get all quote requests with pagination and filters
 */
export async function getQuoteRequests({
  page = 1,
  limit = 10,
  status = null,
  dateFrom = null,
  dateTo = null,
  search = "",
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    ...(status && { status }),
    ...(dateFrom && {
      createdAt: {
        gte: new Date(dateFrom),
      },
    }),
    ...(dateTo && {
      createdAt: {
        lte: new Date(dateTo),
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { location: { contains: search } },
      ],
    }),
  };

  const [quotes, total] = await Promise.all([
    prisma.quoteRequest.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.quoteRequest.count({ where }),
  ]);

  return buildPaginationResponse(quotes, total, page, limit);
}

/**
 * Update quote request
 */
export async function updateQuoteRequest(id, data) {
  return prisma.quoteRequest.update({
    where: { id },
    data,
    include: {
      client: true,
    },
  });
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(id, status, notes = null) {
  const updateData = {
    status,
    ...(status === "CONTACTED" && { respondedAt: new Date() }),
    ...(notes && { notes }),
  };

  return prisma.quoteRequest.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Convert quote to client
 */
export async function convertToClient(id) {
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
  });

  if (!quote) throw new Error("Quote request not found");

  // Create new client from quote data
  const client = await prisma.client.create({
    data: {
      name: quote.name,
      email: quote.email,
      phone: quote.phone,
      address: quote.location,
    },
  });

  // Link quote to client and update status
  await prisma.quoteRequest.update({
    where: { id },
    data: {
      clientId: client.id,
      status: "CONVERTED",
    },
  });

  return client;
}

/**
 * Delete quote request
 */
export async function deleteQuoteRequest(id) {
  return prisma.quoteRequest.delete({
    where: { id },
  });
}

/**
 * Get new quote requests count
 */
export async function getNewQuotesCount() {
  return prisma.quoteRequest.count({
    where: { status: "NEW" },
  });
}

/**
 * Get quote statistics
 */
export async function getQuoteStats(dateFrom = null, dateTo = null) {
  const where = {
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
  };

  const [total, statusCounts, byProjectType] = await Promise.all([
    prisma.quoteRequest.count({ where }),
    prisma.quoteRequest.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    }),
    prisma.quoteRequest.groupBy({
      by: ["projectType"],
      where,
      _count: { projectType: true },
    }),
  ]);

  return {
    total,
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
    byProjectType: byProjectType.reduce((acc, item) => {
      if (item.projectType) {
        acc[item.projectType] = item._count.projectType;
      }
      return acc;
    }, {}),
  };
}

/**
 * Get recent quote requests
 */
export async function getRecentQuotes(limit = 5) {
  return prisma.quoteRequest.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      projectType: true,
      status: true,
      createdAt: true,
    },
  });
}

export default {
  createQuoteRequest,
  getQuoteRequestById,
  getQuoteRequests,
  updateQuoteRequest,
  updateQuoteStatus,
  convertToClient,
  deleteQuoteRequest,
  getNewQuotesCount,
  getQuoteStats,
  getRecentQuotes,
};
