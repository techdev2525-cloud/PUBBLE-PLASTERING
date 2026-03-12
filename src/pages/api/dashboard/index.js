// Dashboard API - Aggregate stats for admin dashboard
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProjects,
      activeProjects,
      totalClients,
      newClientsThisMonth,
      pendingInvoices,
      pendingInvoiceTotal,
      paidThisMonth,
      recentProjects,
      recentQuotes,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "PLANNING", "QUOTED"] } } }),
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.invoice.aggregate({
        where: { status: { in: ["SENT", "OVERDUE"] } },
        _sum: { total: true },
      }),
      prisma.receipt.aggregate({
        where: { paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      }),
      prisma.quoteRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.status(200).json({
      stats: {
        activeProjects,
        totalClients,
        newClientsThisMonth,
        pendingInvoices,
        pendingInvoiceTotal: pendingInvoiceTotal._sum.total || 0,
        revenueThisMonth: paidThisMonth._sum.amount || 0,
      },
      recentProjects,
      recentQuotes,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({ error: "Failed to load dashboard data" });
  }
}
