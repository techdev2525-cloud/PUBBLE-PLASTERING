// Clients API - List and Create
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - List all clients
  if (req.method === "GET") {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      const where = search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {};

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          include: {
            _count: { select: { projects: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.client.count({ where }),
      ]);

      return res.status(200).json({
        clients,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  // POST - Create new client
  if (req.method === "POST") {
    try {
      const { name, email, phone, mobile, company, address, city, postcode, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Client name is required" });
      }

      const client = await prisma.client.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          mobile: mobile || null,
          company: company || null,
          address: address || null,
          city: city || null,
          postcode: postcode || null,
          notes: notes || null,
        },
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ error: "A client with this email already exists" });
      }
      return res.status(500).json({ error: "Failed to create client" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
