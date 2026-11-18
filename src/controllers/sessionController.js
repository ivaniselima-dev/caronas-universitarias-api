// Sessão: login, renovação, logout e "quem sou eu"
import { sessionService } from "../services/index.js";

// GET /session -> 200 com o usuário logado
const getSession = async (req, res) => res.status(200).send(req.context.me);

// POST /session -> 200 com { token, refreshToken, usuario }
const login = async (req, res) => {
  const dados = await sessionService.entrar(req.body.email, req.body.senha);
  return res.status(200).send({ status: "success", data: dados });
};

// POST /session/refresh -> 200 com um NOVO par de tokens
const refresh = async (req, res) => {
  const dados = await sessionService.renovar(req.body.refreshToken);
  return res.status(200).send({ status: "success", data: dados });
};

// DELETE /session -> 204 (sem corpo)
const logout = async (req, res) => {
  await sessionService.sair(req.body.refreshToken);
  return res.status(204).send();
};

export default { getSession, login, refresh, logout };
