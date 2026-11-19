import { Router } from "express";
import { caronaController } from "../controllers/index.js";
import {
  isCaronaOwner,
  validate,
  createCaronaSchema,
  updateCaronaSchema,
  caronaIdParamSchema,
} from "../middlewares/index.js";
import reservaRouter from "./reserva.js";
// import avaliacaoRouter from "./avaliacao.js";

const router = Router();

router.get("/", caronaController.listar);
router.post("/", validate(createCaronaSchema), caronaController.criar);
router.get("/:caronaId", validate(caronaIdParamSchema), caronaController.buscar);
router.put("/:caronaId", validate(caronaIdParamSchema), isCaronaOwner, validate(updateCaronaSchema), caronaController.atualizar);
router.delete("/:caronaId", validate(caronaIdParamSchema), isCaronaOwner, caronaController.apagar);

// URLs compostas: os relacionamentos "moram" dentro da carona
router.use("/:caronaId/reservas", reservaRouter);
// router.use("/:caronaId/avaliacoes", avaliacaoRouter);

export default router;
