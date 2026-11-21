// RELACIONAMENTO 1 — reservas de uma carona (/caronas/:caronaId/reservas)
import { Op } from "sequelize";
import models from "../models/index.js";
import { AppError } from "../utils/index.js";

const passageiro = { model: models.Usuario, as: "passageiro", attributes: ["id", "nome", "curso"] };

// O motorista da carona e o ADMIN veem todas as reservas;
// um passageiro vê só a própria (protege os dados dos outros passageiros)
const listarDaCarona = async (carona, me) => {
  const podeVerTodas = carona.motoristaId === me.id || me.role === "ADMIN";
  return models.Reserva.findAll({
    where: podeVerTodas ? { caronaId: carona.id } : { caronaId: carona.id, passageiroId: me.id },
    include: [passageiro],
    order: [["createdAt", "ASC"]],
  });
};

// Busca a reserva DENTRO da carona do endereço (uma reserva de outra carona = 404)
const buscarDaCarona = async (caronaId, reservaId) =>
  models.Reserva.findOne({ where: { id: reservaId, caronaId }, include: [passageiro] });

// Lugares já ocupados na carona (reservas canceladas não contam)
const lugaresOcupados = async (caronaId, ignorarReservaId) =>
  (await models.Reserva.sum("lugares", {
    where: {
      caronaId,
      status: { [Op.ne]: "cancelada" },
      ...(ignorarReservaId && { id: { [Op.ne]: ignorarReservaId } }),
    },
  })) || 0;

const conferirVagas = async (carona, lugares, ignorarReservaId) => {
  const ocupados = await lugaresOcupados(carona.id, ignorarReservaId);
  if (ocupados + lugares > carona.vagas) {
    throw new AppError(`Vagas insuficientes: restam ${carona.vagas - ocupados}.`, 409);
  }
};

const criar = async (carona, dados, me) => {
  if (carona.motoristaId === me.id) {
    throw new AppError("O motorista não pode reservar a própria carona.", 400);
  }

  // Melhoria: impede reserva duplicada (mesmo passageiro já tem reserva ativa nesta carona)
  const reservaExistente = await models.Reserva.findOne({
    where: { caronaId: carona.id, passageiroId: me.id, status: { [Op.ne]: "cancelada" } },
  });
  if (reservaExistente) {
    throw new AppError("Você já possui uma reserva ativa nesta carona.", 409);
  }

  const lugares = dados.lugares ?? 1;
  await conferirVagas(carona, lugares);
  const reserva = await models.Reserva.create({
    lugares,
    caronaId: carona.id,
    passageiroId: me.id, // o dono é sempre quem está logado
  });
  return buscarDaCarona(carona.id, reserva.id);
};

const atualizar = async (reserva, carona, dados) => {
  const lugares = dados.lugares ?? reserva.lugares;
  const status = dados.status ?? reserva.status;
  if (status !== "cancelada") {
    await conferirVagas(carona, lugares, reserva.id);
  }
  await reserva.update(dados);
  return buscarDaCarona(carona.id, reserva.id);
};

const apagar = async (reserva) => reserva.destroy();

export default { listarDaCarona, buscarDaCarona, criar, atualizar, apagar };
