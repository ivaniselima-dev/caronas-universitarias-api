// RELACIONAMENTO 2 — /caronas/:caronaId/avaliacoes
import { avaliacaoService } from "../services/index.js";
import { AppError } from "../utils/index.js";

const listar = async (req, res) =>
  res.status(200).send({ status: "success", data: await avaliacaoService.listarDaCarona(req.carona.id) });

const buscar = async (req, res) => {
  const avaliacao = await avaliacaoService.buscarDaCarona(req.carona.id, req.params.avaliacaoId);
  if (!avaliacao) throw new AppError("Avaliação não encontrada.", 404);
  return res.status(200).send({ status: "success", data: avaliacao });
};

const criar = async (req, res) =>
  res.status(201).send({ status: "success", data: await avaliacaoService.criar(req.carona, req.body, req.context.me) });

const atualizar = async (req, res) =>
  res.status(200).send({ status: "success", data: await avaliacaoService.atualizar(req.avaliacao, req.body) });

const apagar = async (req, res) => {
  await avaliacaoService.apagar(req.avaliacao);
  return res.status(204).send();
};

export default { listar, buscar, criar, atualizar, apagar };
