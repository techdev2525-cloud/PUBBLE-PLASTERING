// Quote Request API - Update status
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  // GET - Get single quote request
  if (req.method === "GET") {
    try {
      const request = await prisma.quoteRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return res.status(404).json({ error: "Quote request not found" });
      }

      return res.status(200).json(request);
    } catch (error) {
      console.error("Error fetching quote request:", error);
      return res.status(500).json({ error: "Failed to fetch quote request" });
    }
  }

  // PUT - Update quote request status
  if (req.method === "PUT") {
    try {
      const { status, notes } = req.body;

      const request = await prisma.quoteRequest.update({
        where: { id },
        data: {
          status,
          notes,
        },
      });

      return res.status(200).json(request);
    } catch (error) {
      console.error("Error updating quote request:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Quote request not found" });
      }
      return res.status(500).json({ error: "Failed to update quote request" });
    }
  }

  // DELETE - Delete quote request
  if (req.method === "DELETE") {
    try {
      await prisma.quoteRequest.delete({
        where: { id },
      });

      return res
        .status(200)
        .json({ message: "Quote request deleted successfully" });
    } catch (error) {
      console.error("Error deleting quote request:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Quote request not found" });
      }
      return res.status(500).json({ error: "Failed to delete quote request" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
