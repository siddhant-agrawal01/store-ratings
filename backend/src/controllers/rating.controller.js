import { prisma } from "../prisma.js";
import { ratingSchema } from "../validators.js";

export const addRating = async (req, res) => {
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
};
