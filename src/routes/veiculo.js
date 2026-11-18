import { Router } from "express";
import { veiculoController } from "../controllers/index.js";
import {
  isVeiculoOwner,
  validate,
  createVeiculoSchema,
  updateVeiculoSchema,
  veiculoIdParamSchema,
} from "../middlewares/index.js";

const router = Router();

router.get("/", veiculoController.listar);
router.post("/", validate(createVeiculoSchema), veiculoController.criar);
router.get("/:veiculoId", validate(veiculoIdParamSchema), isVeiculoOwner, veiculoController.buscar);
router.put("/:veiculoId", validate(veiculoIdParamSchema), isVeiculoOwner, validate(updateVeiculoSchema), veiculoController.atualizar);
router.delete("/:veiculoId", validate(veiculoIdParamSchema), isVeiculoOwner, veiculoController.apagar);

export default router;
