import models from "../models/index.js";
import { AppError } from "../utils/index.js";

// Dados mostrados junto com a carona (o motorista sem email/senha, só o nome)
const detalhes = [
  { model: models.Usuario, as: "motorista", attributes: ["id", "nome", "curso"] },
  { model: models.Veiculo, as: "veiculo", attributes: ["id", "modelo", "cor", "placa", "lugares"] },
];

const listar = async () =>
  models.Carona.findAll({ include: detalhes, order: [["dataHora", "ASC"]] });

const buscarPorId = async (id) => models.Carona.findByPk(id, { include: detalhes });

// Regra: só dá para oferecer carona com o PRÓPRIO veículo, e sem prometer
// mais vagas do que o carro comporta
const conferirVeiculo = async (veiculoId, vagas, me) => {
  const veiculo = await models.Veiculo.findByPk(veiculoId);
  if (!veiculo) {
    throw new AppError("Veículo não encontrado.", 404);
  }
  if (veiculo.usuarioId !== me.id && me.role !== "ADMIN") {
    throw new AppError("Você só pode oferecer caronas com o seu próprio veículo.", 403);
  }
  if (vagas > veiculo.lugares) {
    throw new AppError(`Este veículo comporta no máximo ${veiculo.lugares} passageiros.`, 400);
  }
};

const criar = async (dados, me) => {
  await conferirVeiculo(dados.veiculoId, dados.vagas, me);
  const carona = await models.Carona.create({ ...dados, motoristaId: me.id });
  return buscarPorId(carona.id);
};

const atualizar = async (carona, dados, me) => {
  // Se trocou o veículo ou as vagas, confere a regra de novo
  if (dados.veiculoId !== undefined || dados.vagas !== undefined) {
    await conferirVeiculo(
      dados.veiculoId ?? carona.veiculoId,
      dados.vagas ?? carona.vagas,
      me,
    );
  }
  await carona.update(dados);
  return buscarPorId(carona.id);
};

const apagar = async (carona) => carona.destroy();

export default { listar, buscarPorId, criar, atualizar, apagar };
