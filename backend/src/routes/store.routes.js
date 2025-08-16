import { Router } from "express";
import { getStores } from "../controllers/store.controller.js";
import { authMiddleware } from "../auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getStores);

export default router;
