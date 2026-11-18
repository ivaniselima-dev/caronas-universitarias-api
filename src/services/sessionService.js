// ATIVIDADE 9 — Login com JWT + Sessão persistente com Refresh Token e Rotação
import crypto from "crypto";
import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { env, AppError } from "../utils/index.js";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

// O refresh token é guardado no banco como hash (SHA-256), igual a uma senha
const hashDoToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Access token (JWT): o "crachá" de curta duração (15 min), assinado com o JWT_SECRET
const criarAccessToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );

// Refresh token: texto aleatório de 40 bytes, válido por 7 dias
const criarRefreshToken = async (usuarioId) => {
  const token = crypto.randomBytes(40).toString("hex");
  await models.RefreshToken.create({
    token: hashDoToken(token),
    expiresAt: new Date(Date.now() + SETE_DIAS_MS),
    usuarioId,
  });
  return token; // o cliente recebe o token "puro"; o banco só tem o hash
};

// LOGIN: confere email e senha e devolve o par de tokens
const entrar = async (email, senha) => {
  const usuario = await models.Usuario.findOne({ where: { email } });

  // Mesma mensagem para email ou senha errados: não revela quais emails existem
  if (!usuario || !(await usuario.validarSenha(senha))) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  return {
    token: criarAccessToken(usuario),
    refreshToken: await criarRefreshToken(usuario.id),
    usuario,
  };
};

// RENOVAÇÃO COM ROTAÇÃO: o refresh token usado é destruído e um novo par é emitido.
// Se alguém tentar reusar um token já consumido, ele não existe mais -> 401.
const renovar = async (refreshToken) => {
  const registro = await models.RefreshToken.findOne({
    where: { token: hashDoToken(refreshToken) },
    include: [{ model: models.Usuario, as: "usuario" }],
  });

  if (!registro || registro.expiresAt < new Date() || !registro.usuario) {
    if (registro) await registro.destroy();
    throw new AppError("Refresh token inválido ou expirado.", 401);
  }

  const usuario = registro.usuario;
  await registro.destroy(); // rotação: o token antigo morre aqui

  return {
    token: criarAccessToken(usuario),
    refreshToken: await criarRefreshToken(usuario.id),
    usuario,
  };
};

// LOGOUT: apaga o refresh token. Sem ele, não dá para renovar a sessão.
const sair = async (refreshToken) => {
  await models.RefreshToken.destroy({ where: { token: hashDoToken(refreshToken) } });
};

// Usado quando a senha muda: derruba todas as sessões daquele usuário
const encerrarTodasAsSessoes = async (usuarioId) => {
  await models.RefreshToken.destroy({ where: { usuarioId } });
};

export default { entrar, renovar, sair, encerrarTodasAsSessoes };
