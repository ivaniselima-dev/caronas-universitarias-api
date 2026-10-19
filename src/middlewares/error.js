import { AppError } from "../utils/index.js";

// Middleware global de erro: é o ÚLTIMO a ser registrado no index.js.
// Qualquer erro lançado em uma rota (inclusive em funções async, no Express 5)
// é entregue aqui, e transformado em uma resposta JSON com o código certo.
const errorMiddleware = (err, req, res, next) => {
  // Erros que nós mesmos lançamos (404, 401, 403...)
  if (err instanceof AppError) {
    return res.status(err.statusCode).send({ status: err.status, message: err.message });
  }

  // Valor repetido em campo único (ex.: email ou placa já cadastrados)
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).send({
      status: "fail",
      message: err.errors.map((e) => `${e.path} já cadastrado`).join(", "),
    });
  }

  // Campo obrigatório faltando ou valor fora da regra (ex.: nota 7)
  if (err.name === "SequelizeValidationError") {
    return res.status(400).send({
      status: "fail",
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // id em formato inválido (ex.: /caronas/abc quando o id é UUID)
  if (err.name === "SequelizeDatabaseError" && err.original?.code === "22P02") {
    return res.status(400).send({ status: "fail", message: "Identificador (ID) em formato inválido" });
  }

  // Referência para um registro que não existe (ex.: veiculoId inexistente)
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).send({ status: "fail", message: "Registro relacionado não existe" });
  }

  // Qualquer outro erro: problema no servidor
  console.error(err);
  return res.status(500).send({ status: "error", message: "Algo deu errado no servidor" });
};

export default errorMiddleware;
