// Invoices API - Get, Update, Delete by ID
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single invoice
  if (req.method === "GET") {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          project: true,
          items: { orderBy: { order: "asc" } },
          receipts: true,
        },
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ error: "Failed to fetch invoice" });
    }
  }

  // PUT - Update invoice
  if (req.method === "PUT") {
    try {
      const { clientId, projectId, issueDate, dueDate, items, notes, terms, status, paidAt, vatRate, includeVAT } = req.body;

      // Recalculate totals if items provided
      let updateData = {
        notes,
        terms,
        status,
      };

      if (clientId) updateData.clientId = clientId;
      if (projectId !== undefined) updateData.projectId = projectId || null;
      if (issueDate) updateData.issueDate = new Date(issueDate);
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (paidAt) updateData.paidAt = new Date(paidAt);
      if (vatRate !== undefined) updateData.vatRate = includeVAT ? parseFloat(vatRate) : 0;

      if (items) {
        const subtotal = items.reduce(
          (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
          0,
        );

        const effectiveVatRate = vatRate !== undefined ? (includeVAT ? parseFloat(vatRate) : 0) : null;
        let calcVatRate = effectiveVatRate;
        if (calcVatRate === null) {
          const current = await prisma.invoice.findUnique({ where: { id } });
          calcVatRate = current.vatRate || 0;
        }
        const vatAmount = calcVatRate ? (subtotal * calcVatRate) / 100 : 0;
        const total = subtotal + vatAmount;

        updateData = {
          ...updateData,
          subtotal,
          vatRate: calcVatRate,
          vatAmount,
          total,
        };

        // Delete existing items and create new ones
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      }

      const invoice = await prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          items: true,
        },
      });

      // Create new items if provided
      if (items) {
        await prisma.invoiceItem.createMany({
          data: items.map((item, index) => ({
            invoiceId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            order: index,
          })),
        });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Invoice not found" });
      }
      return res.status(500).json({ error: "Failed to update invoice" });
    }
  }

  // DELETE - Delete invoice
  if (req.method === "DELETE") {
    try {
      await prisma.invoice.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Invoice not found" });
      }
      return res.status(500).json({ error: "Failed to delete invoice" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
