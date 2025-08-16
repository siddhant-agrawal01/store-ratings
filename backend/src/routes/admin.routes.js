import { Router } from "express";
import { addUser, getMetrics, getStores, addStore, getUsers } from "../controllers/admin.controller.js";
import { authMiddleware, requireRole } from "../auth.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("ADMIN"));

router.post("/users", addUser);
router.get("/metrics", getMetrics);
router.get("/stores", getStores);
router.post("/stores", addStore);
router.get("/users", getUsers);

export default router;
