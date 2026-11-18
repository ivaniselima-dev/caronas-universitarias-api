import { usuarioService } from "../services/index.js";
import { AppError } from "../utils/index.js";

// GET /usuarios (só ADMIN) -> 200
const listar = async (req, res) => res.status(200).send(await usuarioService.listar());

// GET /usuarios/:usuarioId -> 200 ou 404
const buscar = async (req, res) => {
  const usuario = await usuarioService.buscarPorId(req.params.usuarioId);
  if (!usuario) throw new AppError("Usuário não encontrado.", 404);
  return res.status(200).send(usuario);
};

// POST /usuarios (sign up, público) -> 201
const criar = async (req, res) => res.status(201).send(await usuarioService.criar(req.body));

// PUT /usuarios/:usuarioId (o próprio ou ADMIN) -> 200
const atualizar = async (req, res) => {
  // ATIVIDADE RBAC — prevenção de escalação de privilégios:
  // um USER não pode se promover (nem promover ninguém) a ADMIN
  if (req.body.role !== undefined && req.context.me.role !== "ADMIN") {
    throw new AppError("Apenas administradores podem alterar perfis de acesso.", 403);
  }
  const usuario = await usuarioService.buscarPorId(req.params.usuarioId);
  if (!usuario) throw new AppError("Usuário não encontrado.", 404);
  return res.status(200).send(await usuarioService.atualizar(usuario, req.body));
};

// DELETE /usuarios/:usuarioId (o próprio ou ADMIN) -> 204
const apagar = async (req, res) => {
  const usuario = await usuarioService.buscarPorId(req.params.usuarioId);
  if (!usuario) throw new AppError("Usuário não encontrado.", 404);
  await usuarioService.apagar(usuario);
  return res.status(204).send();
};

export default { listar, buscar, criar, atualizar, apagar };
