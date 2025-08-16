import { Router } from "express";
import { addRating } from "../controllers/rating.controller.js";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("USER"));

router.post("/", addRating);

export default router;
