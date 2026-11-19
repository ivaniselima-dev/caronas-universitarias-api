// RELACIONAMENTO 1 — /caronas/:caronaId/reservas
// req.carona já foi carregada pelo middleware carregarCarona
import { reservaService } from "../services/index.js";

const listar = async (req, res) =>
  res.status(200).send(await reservaService.listarDaCarona(req.carona, req.context.me));

const buscar = async (req, res) => res.status(200).send(req.reserva);

const criar = async (req, res) =>
  res.status(201).send(await reservaService.criar(req.carona, req.body, req.context.me));

const atualizar = async (req, res) =>
  res.status(200).send(await reservaService.atualizar(req.reserva, req.carona, req.body));

const apagar = async (req, res) => {
  await reservaService.apagar(req.reserva);
  return res.status(204).send();
};

export default { listar, buscar, criar, atualizar, apagar };
