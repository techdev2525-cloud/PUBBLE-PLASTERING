// BlogPost model helpers
import prisma from "../../config/database";
import {
  getPaginationParams,
  buildPaginationResponse,
} from "../../config/database";
import { slugify, generateUniqueSlug } from "../../utils/slugify";
import readingTime from "reading-time";

/**
 * Create a new blog post
 */
export async function createPost(data) {
  const { tags, ...postData } = data;

  // Generate slug from title
  let slug = slugify(postData.title);
  const existingSlugs = await prisma.blogPost.findMany({
    select: { slug: true },
  });
  slug = generateUniqueSlug(
    slug,
    existingSlugs.map((p) => p.slug),
  );

  // Calculate reading time
  const stats = readingTime(postData.content || "");
  const readingTimeMinutes = Math.ceil(stats.minutes);

  return prisma.blogPost.create({
    data: {
      ...postData,
      slug,
      readingTime: readingTimeMinutes,
      ...(tags && {
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { slug: slugify(tag) },
            create: { name: tag, slug: slugify(tag) },
          })),
        },
      }),
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: true,
      tags: true,
    },
  });
}

/**
 * Get post by ID
 */
export async function getPostById(id) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: true,
      tags: true,
    },
  });
}

/**
 * Get post by slug (for public view)
 */
export async function getPostBySlug(slug, incrementViews = true) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: true,
      tags: true,
    },
  });

  // Increment view count
  if (post && incrementViews) {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}

/**
 * Get all posts with pagination and filters
 */
export async function getPosts({
  page = 1,
  limit = 10,
  status = null,
  categoryId = null,
  authorId = null,
  search = "",
  tag = null,
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    ...(status && { status }),
    ...(categoryId && { categoryId }),
    ...(authorId && { authorId }),
    ...(tag && {
      tags: {
        some: { slug: tag },
      },
    }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take,
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        tags: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return buildPaginationResponse(posts, total, page, limit);
}

/**
 * Get published posts for public blog
 */
export async function getPublishedPosts({
  page = 1,
  limit = 10,
  categorySlug = null,
  tag = null,
  search = "",
}) {
  const { skip, take } = getPaginationParams(page, limit);

  const where = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
    ...(tag && {
      tags: { some: { slug: tag } },
    }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take,
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        tags: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return buildPaginationResponse(posts, total, page, limit);
}

/**
 * Update post
 */
export async function updatePost(id, data) {
  const { tags, ...postData } = data;

  // Recalculate reading time if content changed
  if (postData.content) {
    const stats = readingTime(postData.content);
    postData.readingTime = Math.ceil(stats.minutes);
  }

  // Update slug if title changed
  if (postData.title) {
    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    if (existingPost && existingPost.title !== postData.title) {
      let slug = slugify(postData.title);
      const existingSlugs = await prisma.blogPost.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });
      postData.slug = generateUniqueSlug(
        slug,
        existingSlugs.map((p) => p.slug),
      );
    }
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      ...postData,
      ...(tags && {
        tags: {
          set: [], // Remove existing tags
          connectOrCreate: tags.map((tag) => ({
            where: { slug: slugify(tag) },
            create: { name: tag, slug: slugify(tag) },
          })),
        },
      }),
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: true,
      tags: true,
    },
  });
}

/**
 * Publish post
 */
export async function publishPost(id) {
  return prisma.blogPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}

/**
 * Unpublish post (set to draft)
 */
export async function unpublishPost(id) {
  return prisma.blogPost.update({
    where: { id },
    data: { status: "DRAFT" },
  });
}

/**
 * Delete post
 */
export async function deletePost(id) {
  return prisma.blogPost.delete({
    where: { id },
  });
}

/**
 * Get related posts
 */
export async function getRelatedPosts(postId, limit = 3) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: { tags: true, category: true },
  });

  if (!post) return [];

  return prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      status: "PUBLISHED",
      OR: [
        { categoryId: post.categoryId },
        {
          tags: {
            some: {
              id: { in: post.tags.map((t) => t.id) },
            },
          },
        },
      ],
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: true,
    },
  });
}

/**
 * Get popular posts
 */
export async function getPopularPosts(limit = 5) {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    take: limit,
    orderBy: { viewCount: "desc" },
    include: {
      category: true,
    },
  });
}

/**
 * Get all categories
 */
export async function getCategories() {
  return prisma.blogCategory.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Create category
 */
export async function createCategory(data) {
  return prisma.blogCategory.create({
    data: {
      ...data,
      slug: slugify(data.name),
    },
  });
}

/**
 * Get all tags
 */
export async function getTags() {
  return prisma.blogTag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get blog statistics
 */
export async function getBlogStats() {
  const [totalPosts, publishedPosts, totalViews, popularCategories] =
    await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.blogCategory.findMany({
        include: {
          _count: { select: { posts: true } },
        },
        orderBy: {
          posts: { _count: "desc" },
        },
        take: 5,
      }),
    ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts: totalPosts - publishedPosts,
    totalViews: totalViews._sum.viewCount || 0,
    popularCategories,
  };
}

export default {
  createPost,
  getPostById,
  getPostBySlug,
  getPosts,
  getPublishedPosts,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  getRelatedPosts,
  getPopularPosts,
  getCategories,
  createCategory,
  getTags,
  getBlogStats,
};
