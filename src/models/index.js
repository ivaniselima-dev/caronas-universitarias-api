import Sequelize from "sequelize";
import pg from "pg";
import getUsuarioModel from "./usuario.js";
import getVeiculoModel from "./veiculo.js";
import getCaronaModel from "./carona.js";
import getReservaModel from "./reserva.js";
import getAvaliacaoModel from "./avaliacao.js";
import getSessaoModel from "./sessao.js";

// Conexão com o PostgreSQL do Neon. O endereço vem do arquivo .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  // Mostra no terminal o SQL de cada consulta (desligue com SQL_LOG=false)
  logging: process.env.SQL_LOG === "false" ? false : console.log,
});

// "Prateleira" com todos os models
const models = {
  Usuario: getUsuarioModel(sequelize, Sequelize),
  Veiculo: getVeiculoModel(sequelize, Sequelize),
  Carona: getCaronaModel(sequelize, Sequelize),
  Reserva: getReservaModel(sequelize, Sequelize),
  Avaliacao: getAvaliacaoModel(sequelize, Sequelize),
  Sessao: getSessaoModel(sequelize, Sequelize),
};

// Liga os relacionamentos: executa o "associate" de cada model
Object.keys(models).forEach((key) => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };

export default models;
