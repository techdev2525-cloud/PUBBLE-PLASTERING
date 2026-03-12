// Receipt model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";
import { siteSettings } from "../../config/siteSettings";

/**
 * Generate next receipt number
 */
export async function generateReceiptNumber() {
  const lastReceipt = await prisma.receipt.findFirst({
    orderBy: { createdAt: "desc" },
    select: { receiptNumber: true },
  });

  if (!lastReceipt) {
    return `${siteSettings.documentPrefixes.receipt}0001`;
  }

  const lastNumber = parseInt(
    lastReceipt.receiptNumber.replace(
      siteSettings.documentPrefixes.receipt,
      "",
    ),
  );
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

  return `${siteSettings.documentPrefixes.receipt}${nextNumber}`;
}

/**
 * Create a new receipt
 */
export async function createReceipt(data) {
  const receiptNumber = await generateReceiptNumber();

  const receipt = await prisma.receipt.create({
    data: {
      ...data,
      receiptNumber,
    },
    include: {
      client: true,
      project: true,
      invoice: true,
    },
  });

  // If linked to an invoice, update the invoice paid amount
  if (data.invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (invoice) {
      const newPaidAmount = invoice.paidAmount + data.amount;
      let newStatus = invoice.status;

      if (newPaidAmount >= invoice.totalAmount) {
        newStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIALLY_PAID";
      }

      await prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });
    }
  }

  return receipt;
}

/**
 * Get receipt by ID
 */
export async function getReceiptById(id) {
  return prisma.receipt.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      invoice: {
        include: {
          items: true,
        },
      },
    },
  });
}

/**
 * Get receipt by number
 */
export async function getReceiptByNumber(receiptNumber) {
  return prisma.receipt.findUnique({
    where: { receiptNumber },
    include: {
      client: true,
      project: true,
      invoice: true,
    },
  });
}

/**
 * Get all receipts with pagination and filters
 */
export async function getReceipts({
  page = 1,
  limit = 10,
  clientId = null,
  paymentMethod = null,
  dateFrom = null,
  dateTo = null,
  search = "",
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    ...(clientId && { clientId }),
    ...(paymentMethod && { paymentMethod }),
    ...(dateFrom && {
      paymentDate: {
        gte: new Date(dateFrom),
      },
    }),
    ...(dateTo && {
      paymentDate: {
        lte: new Date(dateTo),
      },
    }),
    ...(search && {
      OR: [
        { receiptNumber: { contains: search } },
        { client: { name: { contains: search } } },
      ],
    }),
  };

  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true },
        },
      },
    }),
    prisma.receipt.count({ where }),
  ]);

  return buildPaginationResponse(receipts, total, page, limit);
}

/**
 * Update receipt
 */
export async function updateReceipt(id, data) {
  return prisma.receipt.update({
    where: { id },
    data,
    include: {
      client: true,
      project: true,
      invoice: true,
    },
  });
}

/**
 * Mark receipt as email sent
 */
export async function markEmailSent(id) {
  return prisma.receipt.update({
    where: { id },
    data: {
      emailSent: true,
      emailSentAt: new Date(),
    },
  });
}

/**
 * Delete receipt
 */
export async function deleteReceipt(id) {
  // Get receipt first to potentially reverse invoice payment
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { invoice: true },
  });

  if (receipt?.invoiceId) {
    // Reverse the payment on the invoice
    const invoice = receipt.invoice;
    const newPaidAmount = Math.max(0, invoice.paidAmount - receipt.amount);
    let newStatus = invoice.status;

    if (newPaidAmount === 0) {
      newStatus = "SENT";
    } else if (newPaidAmount < invoice.totalAmount) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.invoice.update({
      where: { id: receipt.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });
  }

  return prisma.receipt.delete({
    where: { id },
  });
}

/**
 * Get receipt statistics
 */
export async function getReceiptStats(dateFrom = null, dateTo = null) {
  const where = {
    ...(dateFrom && { paymentDate: { gte: new Date(dateFrom) } }),
    ...(dateTo && { paymentDate: { lte: new Date(dateTo) } }),
  };

  const [totals, byMethod] = await Promise.all([
    prisma.receipt.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.receipt.groupBy({
      by: ["paymentMethod"],
      where,
      _sum: { amount: true },
      _count: { paymentMethod: true },
    }),
  ]);

  return {
    totalReceived: totals._sum.amount || 0,
    totalCount: totals._count.id,
    byPaymentMethod: byMethod.reduce((acc, item) => {
      acc[item.paymentMethod] = {
        count: item._count.paymentMethod,
        total: item._sum.amount,
      };
      return acc;
    }, {}),
  };
}

/**
 * Get receipts for a specific client
 */
export async function getClientReceipts(clientId) {
  return prisma.receipt.findMany({
    where: { clientId },
    orderBy: { paymentDate: "desc" },
    include: {
      project: {
        select: { id: true, name: true },
      },
      invoice: {
        select: { id: true, invoiceNumber: true },
      },
    },
  });
}

/**
 * Get monthly receipt totals for dashboard
 */
export async function getMonthlyReceiptTotals(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const receipts = await prisma.receipt.findMany({
    where: {
      paymentDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      paymentDate: true,
    },
  });

  // Group by month
  const monthlyTotals = Array(12).fill(0);
  receipts.forEach((receipt) => {
    const month = receipt.paymentDate.getMonth();
    monthlyTotals[month] += receipt.amount;
  });

  return monthlyTotals;
}

export default {
  generateReceiptNumber,
  createReceipt,
  getReceiptById,
  getReceiptByNumber,
  getReceipts,
  updateReceipt,
  markEmailSent,
  deleteReceipt,
  getReceiptStats,
  getClientReceipts,
  getMonthlyReceiptTotals,
};
