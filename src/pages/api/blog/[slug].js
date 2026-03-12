// Blog Post API - Get by slug, Update, Delete
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const { slug } = req.query;

  // GET - Public: Get published post by slug
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      const isAdmin = !!session;

      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true } },
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Non-admin users can only see published posts
      if (
        !isAdmin &&
        (post.status !== "PUBLISHED" || post.publishedAt > new Date())
      ) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Increment views for public requests
      if (!isAdmin) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        });
      }

      // Parse tags JSON string to array
      const parsed = { ...post, tags: post.tags ? JSON.parse(post.tags) : [] };
      return res.status(200).json(parsed);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ error: "Failed to fetch blog post" });
    }
  }

  // PUT - Admin only: Update post
  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const {
        title,
        content,
        excerpt,
        featuredImage,
        category,
        tags,
        status,
        publishedAt,
        seoTitle,
        metaTitle,
        seoDescription,
        metaDescription,
        readTime,
      } = req.body;

      const post = await prisma.blogPost.update({
        where: { slug },
        data: {
          title,
          content,
          excerpt,
          featuredImage,
          category,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : tags || null,
          status,
          publishedAt: publishedAt
            ? new Date(publishedAt)
            : status === "PUBLISHED"
              ? new Date()
              : null,
          seoTitle: seoTitle || metaTitle || null,
          seoDescription: seoDescription || metaDescription || null,
          readTime: readTime ? parseInt(readTime, 10) : 0,
        },
        include: {
          author: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(500).json({ error: "Failed to update blog post" });
    }
  }

  // DELETE - Admin only: Delete post
  if (req.method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      await prisma.blogPost.delete({
        where: { slug },
      });

      return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(500).json({ error: "Failed to delete blog post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
