// Invoice model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";
import { siteSettings } from "../../config/siteSettings";

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) {
    return `${siteSettings.documentPrefixes.invoice}0001`;
  }

  const lastNumber = parseInt(
    lastInvoice.invoiceNumber.replace(
      siteSettings.documentPrefixes.invoice,
      "",
    ),
  );
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `${siteSettings.documentPrefixes.invoice}${nextNumber}`;
}

/**
 * Create a new invoice
 */
export async function createInvoice(data) {
  const { items, ...invoiceData } = data;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const vatAmount = (subtotal * invoiceData.vatRate) / 100;
  const totalAmount = subtotal + vatAmount;

  const invoiceNumber = await generateInvoiceNumber();

  return prisma.invoice.create({
    data: {
      ...invoiceData,
      invoiceNumber,
      subtotal,
      vatAmount,
      totalAmount,
      items: {
        create: items,
      },
    },
    include: {
      client: true,
      project: true,
      items: true,
    },
  });
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: true,
      receipts: true,
    },
  });
}

/**
 * Get invoice by number
 */
export async function getInvoiceByNumber(invoiceNumber) {
  return prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      client: true,
      project: true,
      items: true,
    },
  });
}

/**
 * Get all invoices with pagination and filters
 */
export async function getInvoices({
  page = 1,
  limit = 10,
  status = null,
  clientId = null,
  dateFrom = null,
  dateTo = null,
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(dateFrom && {
      issueDate: {
        gte: new Date(dateFrom),
      },
    }),
    ...(dateTo && {
      issueDate: {
        lte: new Date(dateTo),
      },
    }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return buildPaginationResponse(invoices, total, page, limit);
}

/**
 * Update invoice
 */
export async function updateInvoice(id, data) {
  const { items, ...invoiceData } = data;

  // If items are being updated, recalculate totals
  if (items) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const vatAmount = (subtotal * (invoiceData.vatRate || 20)) / 100;
    const totalAmount = subtotal + vatAmount;

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    return prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        subtotal,
        vatAmount,
        totalAmount,
        items: {
          create: items,
        },
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });
  }

  return prisma.invoice.update({
    where: { id },
    data: invoiceData,
    include: {
      client: true,
      project: true,
      items: true,
    },
  });
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(id, status) {
  return prisma.invoice.update({
    where: { id },
    data: { status },
  });
}

/**
 * Record payment on invoice
 */
export async function recordPayment(id, amount) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) throw new Error("Invoice not found");

  const newPaidAmount = invoice.paidAmount + amount;
  let newStatus = invoice.status;

  if (newPaidAmount >= invoice.totalAmount) {
    newStatus = "PAID";
  } else if (newPaidAmount > 0) {
    newStatus = "PARTIALLY_PAID";
  }

  return prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
    },
  });
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id) {
  return prisma.invoice.delete({
    where: { id },
  });
}

/**
 * Get outstanding invoices
 */
export async function getOutstandingInvoices() {
  return prisma.invoice.findMany({
    where: {
      status: {
        in: ["SENT", "PARTIALLY_PAID", "OVERDUE"],
      },
    },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(dateFrom = null, dateTo = null) {
  const where = {
    ...(dateFrom && { issueDate: { gte: new Date(dateFrom) } }),
    ...(dateTo && { issueDate: { lte: new Date(dateTo) } }),
  };

  const [totals, statusCounts] = await Promise.all([
    prisma.invoice.aggregate({
      where,
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    totalInvoiced: totals._sum.totalAmount || 0,
    totalPaid: totals._sum.paidAmount || 0,
    outstanding: (totals._sum.totalAmount || 0) - (totals._sum.paidAmount || 0),
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item.status] = {
        count: item._count.status,
        total: item._sum.totalAmount,
      };
      return acc;
    }, {}),
  };
}

export default {
  generateInvoiceNumber,
  createInvoice,
  getInvoiceById,
  getInvoiceByNumber,
  getInvoices,
  updateInvoice,
  updateInvoiceStatus,
  recordPayment,
  deleteInvoice,
  getOutstandingInvoices,
  getInvoiceStats,
};
