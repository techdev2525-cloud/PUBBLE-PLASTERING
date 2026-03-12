// Settings API - Get and Update site settings from database
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// Helper to check admin role
function isAdmin(session) {
  return (
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  );
}

const ALLOWED_SETTINGS_KEYS = [
  "company_name",
  "company_email",
  "company_phone",
  "company_address",
  "company_city",
  "company_postcode",
  "company_vatNumber",
  "social_facebook",
  "social_instagram",
  "social_twitter",
  "social_linkedin",
  "seo_title",
  "seo_description",
  "theme_primaryColor",
  "theme_logo",
  "business_hours",
  "bank_details",
  "invoice_terms",
  "invoice_notes",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_from",
];

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !isAdmin(session)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET - Retrieve all settings
  if (req.method === "GET") {
    try {
      const settings = await prisma.setting.findMany();
      const settingsMap = {};
      settings.forEach((s) => {
        settingsMap[s.key] = s.type === "json" ? JSON.parse(s.value) : s.value;
      });
      return res.status(200).json(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  // PUT - Update settings (accepts key-value pairs)
  if (req.method === "PUT") {
    try {
      const updates = req.body;

      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ error: "Invalid settings data" });
      }

      // Filter to only allowed settings keys
      const safeUpdates = Object.entries(updates).filter(([key]) =>
        ALLOWED_SETTINGS_KEYS.includes(key),
      );

      if (safeUpdates.length === 0) {
        return res
          .status(400)
          .json({ error: "No valid settings keys provided" });
      }

      const results = await Promise.all(
        safeUpdates.map(([key, value]) => {
          const strValue =
            typeof value === "object"
              ? JSON.stringify(value)
              : String(value).slice(0, 5000);
          const type = typeof value === "object" ? "json" : typeof value;
          return prisma.setting.upsert({
            where: { key },
            update: { value: strValue, type },
            create: { key, value: strValue, type },
          });
        }),
      );

      return res
        .status(200)
        .json({ message: "Settings updated", count: results.length });
    } catch (error) {
      console.error("Error updating settings:", error);
      return res.status(500).json({ error: "Failed to update settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
