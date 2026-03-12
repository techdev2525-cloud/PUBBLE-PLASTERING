// Notifications API - List, mark read, mark all read
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - Fetch notifications
  if (req.method === "GET") {
    try {
      const { unreadOnly } = req.query;

      const where = unreadOnly === "true" ? { read: false } : {};

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.notification.count({ where: { read: false } }),
      ]);

      return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  // PUT - Mark notification(s) as read
  if (req.method === "PUT") {
    try {
      const { id, markAllRead } = req.body;

      if (markAllRead) {
        await prisma.notification.updateMany({
          where: { read: false },
          data: { read: true },
        });
        return res
          .status(200)
          .json({ message: "All notifications marked as read" });
      }

      if (id) {
        await prisma.notification.update({
          where: { id },
          data: { read: true },
        });
        return res.status(200).json({ message: "Notification marked as read" });
      }

      return res.status(400).json({ error: "Provide id or markAllRead" });
    } catch (error) {
      console.error("Error updating notification:", error);
      return res.status(500).json({ error: "Failed to update notification" });
    }
  }

  // DELETE - Delete a notification
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "ID required" });
      }
      await prisma.notification.delete({ where: { id } });
      return res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
