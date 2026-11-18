import models from "../models/index.js";

// ADMIN vê todos os veículos; um usuário comum vê só os seus
const listar = async (me) =>
  models.Veiculo.findAll({
    where: me.role === "ADMIN" ? {} : { usuarioId: me.id },
    order: [["modelo", "ASC"]],
  });

const buscarPorId = async (id) => models.Veiculo.findByPk(id);

// O dono é sempre quem está logado (nunca vem do corpo do pedido)
const criar = async (dados, me) => models.Veiculo.create({ ...dados, usuarioId: me.id });

const atualizar = async (veiculo, dados) => veiculo.update(dados);

const apagar = async (veiculo) => veiculo.destroy();

export default { listar, buscarPorId, criar, atualizar, apagar };
