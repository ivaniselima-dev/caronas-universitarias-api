// RELACIONAMENTO 2 — avaliações de uma carona (/caronas/:caronaId/avaliacoes)
import models from "../models/index.js";
import { AppError } from "../utils/index.js";

const autor = { model: models.Usuario, as: "autor", attributes: ["id", "nome"] };

const listarDaCarona = async (caronaId) =>
  models.Avaliacao.findAll({ where: { caronaId }, include: [autor], order: [["createdAt", "DESC"]] });

const buscarDaCarona = async (caronaId, avaliacaoId) =>
  models.Avaliacao.findOne({ where: { id: avaliacaoId, caronaId }, include: [autor] });

const criar = async (carona, dados, me) => {
  if (carona.motoristaId === me.id) {
    throw new AppError("O motorista não pode avaliar a própria carona.", 400);
  }

  // Melhoria: impede avaliação duplicada (mesmo autor já avaliou esta carona)
  const avaliacaoExistente = await models.Avaliacao.findOne({
    where: { caronaId: carona.id, autorId: me.id },
  });
  if (avaliacaoExistente) {
    throw new AppError("Você já avaliou esta carona. Edite sua avaliação existente.", 409);
  }

  const avaliacao = await models.Avaliacao.create({
    nota: dados.nota,
    comentario: dados.comentario,
    caronaId: carona.id,
    autorId: me.id, // o dono é sempre quem está logado
  });
  return buscarDaCarona(carona.id, avaliacao.id);
};

const atualizar = async (avaliacao, dados) => {
  await avaliacao.update(dados);
  return buscarDaCarona(avaliacao.caronaId, avaliacao.id);
};

const apagar = async (avaliacao) => avaliacao.destroy();

export default { listarDaCarona, buscarDaCarona, criar, atualizar, apagar };
