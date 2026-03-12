// Finances API - Aggregate financial data
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [invoices, receipts, clients] = await Promise.all([
      prisma.invoice.findMany({
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.receipt.findMany({
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
          invoice: { select: { id: true, invoiceNumber: true, total: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.findMany({
        include: {
          _count: {
            select: { invoices: true, receipts: true, projects: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // Summary stats
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalReceived = receipts.reduce((sum, rec) => sum + rec.amount, 0);
    const totalVAT = invoices.reduce(
      (sum, inv) => sum + (inv.vatAmount || 0),
      0,
    );
    const totalSubtotal = invoices.reduce(
      (sum, inv) => sum + (inv.subtotal || 0),
      0,
    );
    const outstanding = totalInvoiced - totalReceived;
    const paidInvoices = invoices.filter((i) => i.status === "PAID").length;
    const pendingInvoices = invoices.filter((i) =>
      ["DRAFT", "SENT", "VIEWED"].includes(i.status),
    ).length;
    const overdueInvoices = invoices.filter(
      (i) => i.status === "OVERDUE",
    ).length;
    const avgInvoiceValue =
      invoices.length > 0 ? totalInvoiced / invoices.length : 0;

    return res.status(200).json({
      summary: {
        totalInvoiced,
        totalReceived,
        totalSubtotal,
        totalVAT,
        outstanding,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalInvoices: invoices.length,
        totalReceipts: receipts.length,
        totalClients: clients.length,
        avgInvoiceValue,
      },
      invoices,
      receipts,
      clients,
    });
  } catch (error) {
    console.error("Error fetching finances:", error);
    return res.status(500).json({ error: "Failed to fetch financial data" });
  }
}
