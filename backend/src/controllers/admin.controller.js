import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { addUserSchema, addStoreSchema } from "../validators.js";

export const addUser = async (req, res) => {
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
};

export const getMetrics = async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ totalUsers: users, totalStores: stores, totalRatings: ratings });
};

export const getStores = async (req, res) => {
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
};

export const addStore = async (req, res) => {
  try {
    const data = addStoreSchema.parse(req.body);
    if (data.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: data.ownerId } });
      if (!owner) {
        delete data.ownerId;
      }
    }
    const store = await prisma.store.create({ data });
    res.json(store);
  } catch (e) {
    res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
};

export const getUsers = async (req, res) => {
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
};
