// Invoices API - List and Create
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - List all invoices
  if (req.method === "GET") {
    try {
      const { status, clientId, page = 1, limit = 20 } = req.query;

      const where = {
        ...(status && { status }),
        ...(clientId && { clientId }),
      };

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            client: { select: { id: true, name: true } },
            project: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.invoice.count({ where }),
      ]);

      return res.status(200).json({
        invoices,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  // POST - Create new invoice
  if (req.method === "POST") {
    try {
      // Invoice creation

      const {
        clientId,
        projectId,
        issueDate,
        dueDate,
        items,
        notes,
        terms,
        includeVAT,
        vatRate = 20,
      } = req.body;

      if (!clientId || !items?.length) {
        return res.status(400).json({ error: "Client and items are required" });
      }

      // Calculate totals with rounding to avoid floating-point errors
      const subtotal = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        return sum + Math.round(qty * price * 100) / 100;
      }, 0);
      const vatAmount = includeVAT
        ? Math.round(((subtotal * vatRate) / 100) * 100) / 100
        : 0;
      const total = Math.round((subtotal + vatAmount) * 100) / 100;

      // Generate invoice number
      const count = await prisma.invoice.count();
      const year = new Date().getFullYear();
      const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId,
          projectId: projectId && projectId !== "" ? projectId : null,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          subtotal,
          vatRate: includeVAT ? vatRate : 0,
          vatAmount,
          total,
          notes: notes || null,
          terms: terms || null,
          status: "DRAFT",
          items: {
            create: items.map((item, index) => ({
              description: item.description,
              quantity: parseFloat(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice) || 0,
              total:
                (parseFloat(item.quantity) || 1) *
                (parseFloat(item.unitPrice) || 0),
              order: index,
            })),
          },
        },
        include: {
          client: { select: { id: true, name: true } },
          items: true,
        },
      });

      return res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.status(500).json({
        error: "Failed to create invoice",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
