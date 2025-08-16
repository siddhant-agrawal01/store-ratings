import { Router } from "express";
import { getRatings } from "../controllers/owner.controller.js";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("STORE_OWNER"));

router.get("/ratings", getRatings);

export default router;
