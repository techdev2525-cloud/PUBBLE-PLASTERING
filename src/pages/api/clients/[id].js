// Clients API - Get, Update, Delete by ID
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single client
  if (req.method === "GET") {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          projects: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          invoices: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      return res.status(500).json({ error: "Failed to fetch client" });
    }
  }

  // PUT - Update client
  if (req.method === "PUT") {
    try {
      const { name, email, phone, address, city, postcode, notes } = req.body;

      const client = await prisma.client.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          address,
          city,
          postcode,
          notes,
        },
      });

      return res.status(200).json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.status(500).json({ error: "Failed to update client" });
    }
  }

  // DELETE - Delete client
  if (req.method === "DELETE") {
    try {
      await prisma.client.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.status(500).json({ error: "Failed to delete client" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
