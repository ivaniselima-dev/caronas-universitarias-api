import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { AppError } from "../utils/index.js";

// PORTEIRO DA API: toda rota registrada depois dele exige login.
// O cliente precisa enviar o cabeçalho:  Authorization: Bearer <token>
const authMiddleware = async (req, res, next) => {
  const cabecalho = req.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");

  // 1. Veio um token?
  if (tipo !== "Bearer" || !token) {
    throw new AppError("Faça login para acessar este recurso", 401);
  }

  // 2. O token é verdadeiro e está dentro do prazo?
  let dados;
  try {
    dados = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Token inválido ou expirado", 401);
  }

  // 3. A sessão ainda existe? (se o usuário fez logout, ela foi apagada)
  const sessao = await models.Sessao.findByPk(dados.sessao);
  if (!sessao || sessao.usuarioId !== dados.sub || sessao.expiraEm < new Date()) {
    throw new AppError("Sessão encerrada. Faça login novamente", 401);
  }

  // 4. O usuário ainda existe?
  const usuario = await models.Usuario.findByPk(dados.sub);
  if (!usuario) {
    throw new AppError("Usuário não encontrado", 401);
  }

  // Deixa o usuário logado disponível para as próximas etapas (controllers)
  req.usuario = usuario;
  req.sessaoId = sessao.id;
  next();
};

export default authMiddleware;
