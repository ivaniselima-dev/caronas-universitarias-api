import { caronaService } from "../services/index.js";
import { AppError } from "../utils/index.js";

// GET /caronas -> 200 (todas, com suporte a filtros ?origem=...&destino=...)
const listar = async (req, res) =>
  res.status(200).send({ status: "success", data: await caronaService.listar(req.query) });

// GET /caronas/:caronaId -> 200 ou 404
const buscar = async (req, res) => {
  const carona = await caronaService.buscarPorId(req.params.caronaId);
  if (!carona) throw new AppError("Carona não encontrada.", 404);
  return res.status(200).send({ status: "success", data: carona });
};

// POST /caronas -> 201 (o motorista é quem está logado)
const criar = async (req, res) =>
  res.status(201).send({ status: "success", data: await caronaService.criar(req.body, req.context.me) });

// PUT /caronas/:caronaId (só o motorista ou ADMIN) -> 200
const atualizar = async (req, res) =>
  res.status(200).send({ status: "success", data: await caronaService.atualizar(req.carona, req.body, req.context.me) });

// DELETE /caronas/:caronaId (só o motorista ou ADMIN) -> 204
const apagar = async (req, res) => {
  await caronaService.apagar(req.carona);
  return res.status(204).send();
};

export default { listar, buscar, criar, atualizar, apagar };
