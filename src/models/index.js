import Sequelize from "sequelize";
import pg from "pg";
import { env } from "../utils/index.js";
import getUsuarioModel from "./usuario.js";
import getRefreshTokenModel from "./refreshToken.js";
import getVeiculoModel from "./veiculo.js";
import getCaronaModel from "./carona.js";
import getReservaModel from "./reserva.js";
import getAvaliacaoModel from "./avaliacao.js";

// Conexão com o PostgreSQL do Neon (endereço validado em utils/env.js)
const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: process.env.SQL_LOG === "true" ? console.log : false,
});

// "Prateleira" com todos os models
const models = {
  Usuario: getUsuarioModel(sequelize, Sequelize),
  RefreshToken: getRefreshTokenModel(sequelize, Sequelize),
  Veiculo: getVeiculoModel(sequelize, Sequelize),
  Carona: getCaronaModel(sequelize, Sequelize),
  Reserva: getReservaModel(sequelize, Sequelize),
  Avaliacao: getAvaliacaoModel(sequelize, Sequelize),
};

// Liga os relacionamentos: executa o "associate" de cada model
Object.keys(models).forEach((key) => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
