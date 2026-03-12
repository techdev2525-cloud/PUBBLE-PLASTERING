// Client model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";

/**
 * Create a new client
 */
export async function createClient(data) {
  return prisma.client.create({
    data,
  });
}

/**
 * Get client by ID with related data
 */
export async function getClientById(id, includeRelations = false) {
  return prisma.client.findUnique({
    where: { id },
    include: includeRelations
      ? {
          projects: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          invoices: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          receipts: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        }
      : undefined,
  });
}

/**
 * Get all clients with pagination and search
 */
export async function getClients({
  page = 1,
  limit = 10,
  search = "",
  isActive = true,
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    isActive,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { postcode: { contains: search } },
      ],
    }),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return buildPaginationResponse(clients, total, page, limit);
}

/**
 * Update client
 */
export async function updateClient(id, data) {
  return prisma.client.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete client (deactivate)
 */
export async function deleteClient(id) {
  return prisma.client.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Get client financial summary
 */
export async function getClientFinancials(clientId) {
  const [invoices, receipts] = await Promise.all([
    prisma.invoice.findMany({
      where: { clientId },
      select: {
        totalAmount: true,
        paidAmount: true,
        status: true,
      },
    }),
    prisma.receipt.findMany({
      where: { clientId },
      select: {
        amount: true,
      },
    }),
  ]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = receipts.reduce((sum, rec) => sum + rec.amount, 0);
  const outstanding = totalInvoiced - totalPaid;

  return {
    totalInvoiced,
    totalPaid,
    outstanding,
    invoiceCount: invoices.length,
    receiptCount: receipts.length,
  };
}

/**
 * Search clients for autocomplete
 */
export async function searchClients(query, limit = 10) {
  return prisma.client.findMany({
    where: {
      isActive: true,
      OR: [{ name: { contains: query } }, { email: { contains: query } }],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

export default {
  createClient,
  getClientById,
  getClients,
  updateClient,
  deleteClient,
  getClientFinancials,
  searchClients,
};
