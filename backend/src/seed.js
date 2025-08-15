import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

async function main() {
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const ownerPass = await bcrypt.hash("Owner@123", 10);
  const userPass = await bcrypt.hash("User@1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Administrator Admin",
      email: "admin@example.com",
      address: "HQ, Admin Street, City, Country",
      role: "ADMIN",
      password: adminPass
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Default Store Owner Name",
      email: "owner@example.com",
      address: "Owner Address, City, Country",
      role: "STORE_OWNER",
      password: ownerPass
    }
  });

  const store = await prisma.store.upsert({
    where: { id: "seed-store-1" },
    update: {},
    create: {
      id: "seed-store-1",
      name: "Green Grocery",
      email: "green@store.com",
      address: "12 Market Road, Springfield",
      ownerId: owner.id
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Normal Platform User One",
      email: "user@example.com",
      address: "42 User Lane, City, Country",
      role: "USER",
      password: userPass
    }
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store.id } },
    update: { value: 4 },
    create: { userId: user.id, storeId: store.id, value: 4 }
  });

  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
