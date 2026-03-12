import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Database configuration
export const dbConfig = {
  // Connection URL from environment
  connectionUrl: process.env.DATABASE_URL,

  // Prisma Client instance
  client: prisma,

  // Transaction options
  transactionOptions: {
    maxWait: 5000, // 5s
    timeout: 10000, // 10s
  },
};

// Helper function to handle database operations with error handling
export async function dbOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    throw new Error("Database operation failed");
  }
}

// Helper for paginated queries
export function getPaginationParams(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

// Helper to build pagination response
export function buildPaginationResponse(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export default prisma;
