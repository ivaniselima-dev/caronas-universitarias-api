import { authService } from "../services/index.js";

// POST /auth/signup
const signup = async (req, res) => {
  const usuario = await authService.cadastrar(req.body);
  return res.status(201).send(usuario); // 201 = criado
};

// POST /auth/login
const login = async (req, res) => {
  const { token, usuario } = await authService.entrar(req.body);
  return res.send({ token, usuario });
};

// POST /auth/logout (precisa estar logado)
const logout = async (req, res) => {
  await authService.sair(req.sessaoId);
  return res.send({ message: "Logout realizado com sucesso" });
};

// GET /auth/me (precisa estar logado): mostra quem é o usuário do token
const me = async (req, res) => {
  return res.send(req.usuario);
};

export default { signup, login, logout, me };
