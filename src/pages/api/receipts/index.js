// Receipts API - List and Create
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - List all receipts
  if (req.method === "GET") {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      const where = search
        ? {
            OR: [
              { receiptNumber: { contains: search } },
              { client: { name: { contains: search } } },
            ],
          }
        : {};

      const [receipts, total] = await Promise.all([
        prisma.receipt.findMany({
          where,
          include: {
            client: { select: { id: true, name: true } },
            project: { select: { id: true, title: true } },
            invoice: { select: { id: true, invoiceNumber: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.receipt.count({ where }),
      ]);

      return res.status(200).json({
        receipts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching receipts:", error);
      return res.status(500).json({ error: "Failed to fetch receipts" });
    }
  }

  // POST - Create new receipt
  if (req.method === "POST") {
    try {
      // Receipt creation

      const {
        clientId,
        projectId,
        invoiceId,
        amount,
        paymentMethod,
        paymentDate,
        reference,
        notes,
      } = req.body;

      if (!clientId || !amount || !paymentMethod) {
        return res
          .status(400)
          .json({ error: "Client, amount, and payment method are required" });
      }

      // Generate receipt number
      const year = new Date().getFullYear();
      const lastReceipt = await prisma.receipt.findFirst({
        where: { receiptNumber: { startsWith: `REC-${year}` } },
        orderBy: { receiptNumber: "desc" },
      });

      let nextNumber = 1;
      if (lastReceipt) {
        const lastNumber = parseInt(lastReceipt.receiptNumber.split("-")[2]);
        nextNumber = lastNumber + 1;
      }
      const receiptNumber = `REC-${year}-${String(nextNumber).padStart(3, "0")}`;

      const receipt = await prisma.receipt.create({
        data: {
          receiptNumber,
          clientId,
          projectId: projectId && projectId !== "" ? projectId : null,
          invoiceId: invoiceId && invoiceId !== "" ? invoiceId : null,
          amount: parseFloat(amount),
          paymentMethod,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          reference: reference || null,
          notes: notes || null,
        },
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
      });

      // If linked to invoice, update invoice status to PAID
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        });
      }

      return res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating receipt:", error);
      return res.status(500).json({
        error: "Failed to create receipt",
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
