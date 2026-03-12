const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();

  try {
    const hash = await bcrypt.hash("admin123", 12);
    const user = await prisma.user.create({
      data: {
        email: "admin@pubbleplastering.com",
        password: hash,
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log("Admin user created:", user.email);
  } catch (e) {
    if (e.code === "P2002") {
      console.log("Admin user already exists");
    } else {
      throw e;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
