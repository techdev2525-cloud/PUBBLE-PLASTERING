// Blog Posts API - List and Create
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  // GET - Public: List published posts, Admin: List all posts
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, res, authOptions);
      const { category, tag, status, page = 1, limit = 10 } = req.query;

      // Public users only see published posts
      const isAdmin = !!session;

      const where = {
        ...(!isAdmin && {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
        }),
        ...(isAdmin && status && { status }),
        ...(category && { category }),
        ...(tag && { tags: { contains: tag } }),
      };

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { publishedAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.blogPost.count({ where }),
      ]);

      const parseTags = (post) => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      });

      return res.status(200).json({
        posts: posts.map(parseTags),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  }

  // POST - Admin only: Create new post
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const {
        title,
        slug,
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

      if (!title || !slug || !content) {
        return res
          .status(400)
          .json({ error: "Title, slug, and content are required" });
      }

      // Check if slug exists
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) {
        return res
          .status(400)
          .json({ error: "A post with this slug already exists" });
      }

      const post = await prisma.blogPost.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          category,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : tags || null,
          status: status || "DRAFT",
          publishedAt: publishedAt
            ? new Date(publishedAt)
            : status === "PUBLISHED"
              ? new Date()
              : null,
          seoTitle: seoTitle || metaTitle || null,
          seoDescription: seoDescription || metaDescription || null,
          readTime: readTime ? parseInt(readTime, 10) : 0,
          authorId: session.user.id,
        },
        include: {
          author: { select: { id: true, name: true } },
        },
      });

      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      return res.status(500).json({ error: "Failed to create blog post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
