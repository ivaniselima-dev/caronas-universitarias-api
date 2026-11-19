// RELACIONAMENTO 1 — URL composta: /caronas/:caronaId/reservas
import { Router } from "express";
import { reservaController } from "../controllers/index.js";
import {
  carregarCarona,
  podeVerReserva,
  isReservaOwner,
  validate,
  caronaIdParamSchema,
  reservaIdParamSchema,
  createReservaSchema,
  updateReservaSchema,
} from "../middlewares/index.js";

// mergeParams: deixa este roteador enxergar o :caronaId da URL "de fora"
const router = Router({ mergeParams: true });

router.get("/", validate(caronaIdParamSchema), carregarCarona, reservaController.listar);
router.post("/", validate(caronaIdParamSchema), carregarCarona, validate(createReservaSchema), reservaController.criar);
router.get("/:reservaId", validate(reservaIdParamSchema), carregarCarona, podeVerReserva, reservaController.buscar);
router.put("/:reservaId", validate(reservaIdParamSchema), carregarCarona, isReservaOwner, validate(updateReservaSchema), reservaController.atualizar);
router.delete("/:reservaId", validate(reservaIdParamSchema), carregarCarona, isReservaOwner, reservaController.apagar);

export default router;
