import { veiculoService } from "../services/index.js";

// GET /veiculos -> 200 (os seus; ADMIN vê todos)
const listar = async (req, res) => res.status(200).send(await veiculoService.listar(req.context.me));

// GET /veiculos/:veiculoId -> 200 (o middleware isVeiculoOwner já buscou e guardou em req.veiculo)
const buscar = async (req, res) => res.status(200).send(req.veiculo);

// POST /veiculos -> 201
const criar = async (req, res) =>
  res.status(201).send(await veiculoService.criar(req.body, req.context.me));

// PUT /veiculos/:veiculoId -> 200
const atualizar = async (req, res) =>
  res.status(200).send(await veiculoService.atualizar(req.veiculo, req.body));

// DELETE /veiculos/:veiculoId -> 204
const apagar = async (req, res) => {
  await veiculoService.apagar(req.veiculo);
  return res.status(204).send();
};

export default { listar, buscar, criar, atualizar, apagar };
