import { prisma } from "../prisma.js";

export const getRatings = async (req, res) => {
  const store = await prisma.store.findFirst({ where: { ownerId: req.user.id } });
  if (!store) return res.status(404).json({ message: "No store assigned to owner" });
  const ratings = await prisma.rating.findMany({
    where: { storeId: store.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  const average = ratings.length ? ratings.reduce((a,b)=>a+b.value,0)/ratings.length : null;
  res.json({ store: { id: store.id, name: store.name }, average, ratings });
};
