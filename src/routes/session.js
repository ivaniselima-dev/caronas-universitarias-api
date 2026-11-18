import { Router } from "express";
import { sessionController } from "../controllers/index.js";
import { authLimiterMiddleware, validate, loginSchema, refreshTokenSchema } from "../middlewares/index.js";

const router = Router();

router.get("/", sessionController.getSession); // quem sou eu (exige login)
// login: limite estrito de 5 tentativas / 15 min só nesta rota
router.post("/", authLimiterMiddleware, validate(loginSchema), sessionController.login);
router.post("/refresh", validate(refreshTokenSchema), sessionController.refresh);
router.delete("/", validate(refreshTokenSchema), sessionController.logout); // logout

export default router;
