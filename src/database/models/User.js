// User model helpers and types
import prisma from "../../config/database";
import { hashPassword, verifyPassword } from "../../config/auth";

/**
 * Create a new user
 */
export async function createUser(data) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  });
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
  });
}

/**
 * Update user
 */
export async function updateUser(id, data) {
  // If password is being updated, hash it
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      updatedAt: true,
    },
  });
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Deactivate user
 */
export async function deactivateUser(id) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(id) {
  return prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  });
}

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  getAllUsers,
  deactivateUser,
  updateLastLogin,
};
