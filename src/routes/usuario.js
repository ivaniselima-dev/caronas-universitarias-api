import { Router } from "express";
import { usuarioController } from "../controllers/index.js";
import {
  restrictTo,
  isUsuarioOwner,
  validate,
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioIdParamSchema,
} from "../middlewares/index.js";

const router = Router();

// A ordem importa: cada pedido passa pelos middlewares da esquerda para a direita
router.post("/", validate(createUsuarioSchema), usuarioController.criar); // sign up (público)
router.get("/", restrictTo("ADMIN"), usuarioController.listar); // só ADMIN lista todos
router.get("/:usuarioId", validate(usuarioIdParamSchema), usuarioController.buscar);
router.put("/:usuarioId", validate(usuarioIdParamSchema), isUsuarioOwner, validate(updateUsuarioSchema), usuarioController.atualizar);
router.delete("/:usuarioId", validate(usuarioIdParamSchema), isUsuarioOwner, usuarioController.apagar);

export default router;
