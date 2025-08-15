import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";
import { authMiddleware, requireRole } from "./auth.js";
import {
  registerSchema, loginSchema, addUserSchema, addStoreSchema,
  ratingSchema, changePasswordSchema
} from "./validators.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;

// ---- Helpers ----
const sign = (user) => jwt.sign({
  id: user.id, email: user.email, role: user.role, name: user.name
}, process.env.JWT_SECRET, { expiresIn: "7d" });

// ---- Auth Routes ----
app.post("/api/auth/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hash, role: "USER" }
    });
    return res.json({ token: sign(user) });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    return res.json({ token: sign(user) });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    res.json({ message: "Password updated" });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

// ---- Admin Routes ----
app.post("/api/admin/users", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const data = addUserSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { ...data, password: hash } });
    res.json(user);
  } catch (e) {
    res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

app.get("/api/admin/metrics", authMiddleware, requireRole("ADMIN"), async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ totalUsers: users, totalStores: stores, totalRatings: ratings });
});

app.get("/api/admin/stores", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { q = "", sort = "name", order = "asc" } = req.query;
  const where = {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } }
    ]
  };
  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    include: {
      ratings: { select: { value: true } },
      owner: { select: { id: true, name: true, email: true } }
    }
  });
  const data = stores.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    owner: s.owner,
    rating: s.ratings.length ? s.ratings.reduce((a,b)=>a+b.value,0)/s.ratings.length : null
  }));
  res.json(data);
});

app.post("/api/admin/stores", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const data = addStoreSchema.parse(req.body);
    const store = await prisma.store.create({ data });
    res.json(store);
  } catch (e) {
    res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

app.get("/api/admin/users", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { q = "", role, sort = "name", order = "asc" } = req.query;
  const where = {
    AND: [
      role ? { role } : {},
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } }
        ]
      }
    ]
  };
  const users = await prisma.user.findMany({
    where,
    orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    include: {
      stores: { select: { id: true } },
      ratings: true
    }
  });
  // If user is Store Owner, include their store rating (average of their store if exists)
  const storeByOwner = await prisma.store.findMany({ select: { id: true, ownerId: true } });
  const map = new Map(storeByOwner.map(s => [s.ownerId, s.id]));
  const result = await Promise.all(users.map(async u => {
    let ownerRating = null;
    if (u.role === "STORE_OWNER" && map.get(u.id)) {
      const storeId = map.get(u.id);
      const rs = await prisma.rating.findMany({ where: { storeId }, select: { value: true } });
      ownerRating = rs.length ? rs.reduce((a,b)=>a+b.value,0)/rs.length : null;
    }
    return {
      id: u.id, name: u.name, email: u.email, address: u.address, role: u.role,
      storeOwnerAverageRating: ownerRating
    };
  }));
  res.json(result);
});

// ---- Public Stores (for users) ----
app.get("/api/stores", authMiddleware, async (req, res) => {
  const { q = "", sort = "name", order = "asc" } = req.query;
  const where = {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } }
    ]
  };
  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
    include: {
      ratings: { select: { value: true, userId: true } }
    }
  });
  const data = stores.map(s => {
    const userRating = s.ratings.find(r => r.userId === req.user.id)?.value ?? null;
    const avg = s.ratings.length ? s.ratings.reduce((a,b)=>a+b.value,0)/s.ratings.length : null;
    return { id: s.id, name: s.name, address: s.address, overallRating: avg, userRating };
  });
  res.json(data);
});

// ---- Ratings ----
app.post("/api/ratings", authMiddleware, requireRole("USER"), async (req, res) => {
  try {
    const data = ratingSchema.parse(req.body);
    const rating = await prisma.rating.upsert({
      where: { userId_storeId: { userId: req.user.id, storeId: data.storeId } },
      create: { ...data, userId: req.user.id },
      update: { value: data.value }
    });
    res.json(rating);
  } catch (e) {
    res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
});

// ---- Owner Dashboard ----
app.get("/api/owner/ratings", authMiddleware, requireRole("STORE_OWNER"), async (req, res) => {
  const store = await prisma.store.findFirst({ where: { ownerId: req.user.id } });
  if (!store) return res.status(404).json({ message: "No store assigned to owner" });
  const ratings = await prisma.rating.findMany({
    where: { storeId: store.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  const average = ratings.length ? ratings.reduce((a,b)=>a+b.value,0)/ratings.length : null;
  res.json({ store: { id: store.id, name: store.name }, average, ratings });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
