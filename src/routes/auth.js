import { Router } from "express";
import { authController } from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const router = Router();

// Rotas PÚBLICAS: as únicas que funcionam sem login
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Rotas que exigem login (o authMiddleware roda antes do controller)
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
