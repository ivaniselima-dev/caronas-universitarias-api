// RELACIONAMENTO 2 — URL composta: /caronas/:caronaId/avaliacoes
import { Router } from "express";
import { avaliacaoController } from "../controllers/index.js";
import {
  carregarCarona,
  isAvaliacaoOwner,
  validate,
  caronaIdParamSchema,
  avaliacaoIdParamSchema,
  createAvaliacaoSchema,
  updateAvaliacaoSchema,
} from "../middlewares/index.js";

const router = Router({ mergeParams: true });

router.get("/", validate(caronaIdParamSchema), carregarCarona, avaliacaoController.listar);
router.post("/", validate(caronaIdParamSchema), carregarCarona, validate(createAvaliacaoSchema), avaliacaoController.criar);
router.get("/:avaliacaoId", validate(avaliacaoIdParamSchema), carregarCarona, avaliacaoController.buscar);
router.put("/:avaliacaoId", validate(avaliacaoIdParamSchema), carregarCarona, isAvaliacaoOwner, validate(updateAvaliacaoSchema), avaliacaoController.atualizar);
router.delete("/:avaliacaoId", validate(avaliacaoIdParamSchema), carregarCarona, isAvaliacaoOwner, avaliacaoController.apagar);

export default router;
