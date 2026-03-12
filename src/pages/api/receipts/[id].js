// Receipts API - Get, Update, Delete single receipt
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single receipt
  if (req.method === "GET") {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, title: true } },
          invoice: { select: { id: true, invoiceNumber: true, total: true } },
        },
      });

      if (!receipt) {
        return res.status(404).json({ error: "Receipt not found" });
      }

      return res.status(200).json(receipt);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      return res.status(500).json({ error: "Failed to fetch receipt" });
    }
  }

  // PUT - Update receipt
  if (req.method === "PUT") {
    try {
      const { clientId, projectId, invoiceId, amount, paymentMethod, paymentDate, reference, notes } = req.body;

      // Get existing receipt to check if invoice link changed
      const existing = await prisma.receipt.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Receipt not found" });

      const data = {
        amount: amount ? parseFloat(amount) : undefined,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        reference,
        notes,
      };

      if (clientId) data.clientId = clientId;
      if (projectId !== undefined) data.projectId = projectId || null;
      if (invoiceId !== undefined) data.invoiceId = invoiceId || null;

      const receipt = await prisma.receipt.update({
        where: { id },
        data,
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
      });

      // If invoice link changed, update old and new invoice statuses
      if (invoiceId !== undefined && existing.invoiceId !== (invoiceId || null)) {
        // Revert old invoice if it had one
        if (existing.invoiceId) {
          const otherReceipts = await prisma.receipt.count({
            where: { invoiceId: existing.invoiceId, id: { not: id } },
          });
          if (otherReceipts === 0) {
            await prisma.invoice.update({
              where: { id: existing.invoiceId },
              data: { status: "SENT", paidAt: null },
            });
          }
        }
        // Mark new invoice as PAID if linked
        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "PAID", paidAt: new Date() },
          });
        }
      }

      return res.status(200).json(receipt);
    } catch (error) {
      console.error("Error updating receipt:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Receipt not found" });
      }
      return res.status(500).json({ error: "Failed to update receipt" });
    }
  }

  // DELETE - Delete receipt
  if (req.method === "DELETE") {
    try {
      // Get receipt before deleting to check invoice link
      const receipt = await prisma.receipt.findUnique({ where: { id } });
      if (!receipt) return res.status(404).json({ error: "Receipt not found" });

      await prisma.receipt.delete({ where: { id } });

      // If receipt was linked to an invoice, check if we should revert invoice status
      if (receipt.invoiceId) {
        const remainingReceipts = await prisma.receipt.count({
          where: { invoiceId: receipt.invoiceId },
        });
        if (remainingReceipts === 0) {
          await prisma.invoice.update({
            where: { id: receipt.invoiceId },
            data: { status: "SENT", paidAt: null },
          });
        }
      }

      return res.status(200).json({ message: "Receipt deleted" });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Receipt not found" });
      }
      return res.status(500).json({ error: "Failed to delete receipt" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
