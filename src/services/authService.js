import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { AppError } from "../utils/index.js";

// Quanto tempo o login vale (24 horas)
const DURACAO_LOGIN_MS = 24 * 60 * 60 * 1000;

// SIGN UP: cadastra um usuário novo.
// A senha é criptografada automaticamente pelo hook do model Usuario.
const cadastrar = async ({ nome, email, senha, curso, telefone }) => {
  return await models.Usuario.create({ nome, email, senha, curso, telefone });
};

// LOGIN: confere email e senha e devolve um token.
const entrar = async ({ email, senha }) => {
  if (!email || !senha) {
    throw new AppError("Informe email e senha", 400);
  }

  // scope("comSenha"): só aqui pedimos a senha (o hash) ao banco
  const usuario = await models.Usuario.scope("comSenha").findOne({ where: { email } });

  // Mesma mensagem para email ou senha errados, para não revelar quais emails existem
  if (!usuario || !(await usuario.senhaCorreta(senha))) {
    throw new AppError("Email ou senha inválidos", 401);
  }

  // Abre uma sessão para este login
  const sessao = await models.Sessao.create({
    usuarioId: usuario.id,
    expiraEm: new Date(Date.now() + DURACAO_LOGIN_MS),
  });

  // O token (JWT) é o "crachá": leva o id do usuário e o id da sessão,
  // assinado com o JWT_SECRET para que ninguém consiga falsificá-lo.
  const token = jwt.sign(
    { sub: usuario.id, sessao: sessao.id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  return { token, usuario };
};

// LOGOUT: apaga a sessão. A partir daí, o token deixa de ser aceito.
const sair = async (sessaoId) => {
  await models.Sessao.destroy({ where: { id: sessaoId } });
};

export default { cadastrar, entrar, sair };
