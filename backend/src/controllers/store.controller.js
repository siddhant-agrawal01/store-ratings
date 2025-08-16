import { prisma } from "../prisma.js";

export const getStores = async (req, res) => {
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
};
