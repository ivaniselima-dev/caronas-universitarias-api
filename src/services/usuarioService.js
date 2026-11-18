import models from "../models/index.js";
import sessionService from "./sessionService.js";

const listar = async () => models.Usuario.findAll({ order: [["nome", "ASC"]] });

const buscarPorId = async (id) => models.Usuario.findByPk(id);

// SIGN UP: o "role" NÃO é aceito aqui. Todo cadastro novo nasce como USER.
const criar = async ({ nome, email, senha, curso, telefone }) =>
  models.Usuario.create({ nome, email, senha, curso, telefone });

const atualizar = async (usuario, dados) => {
  const atualizado = await usuario.update(dados);
  // Trocou a senha? Derruba as sessões abertas, por segurança
  if (dados.senha !== undefined) {
    await sessionService.encerrarTodasAsSessoes(usuario.id);
  }
  return atualizado;
};

const apagar = async (usuario) => usuario.destroy();

export default { listar, buscarPorId, criar, atualizar, apagar };
