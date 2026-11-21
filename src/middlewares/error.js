// ATIVIDADE 4 — Middleware global de tratamento de erros
// É o ÚLTIMO middleware do index.js e tem 4 parâmetros (err, req, res, next).
// No Express 5, qualquer erro lançado numa função async vem parar aqui sozinho,
// sem precisar de try/catch. Toda falha vira um JSON previsível:
//   { "status": "fail" | "error", "message": "...", "stack": "..." (só em desenvolvimento) }
import { ZodError } from "zod";
import { env, AppError } from "../utils/index.js";

const errorMiddleware = (err, req, res, next) => {
  // O stack trace (detalhes internos) só aparece em desenvolvimento, NUNCA em produção
  const emDesenvolvimento = env.NODE_ENV === "development";
  const responder = (statusCode, message, extra = {}) =>
    res.status(statusCode).send({
      status: `${statusCode}`.startsWith("4") ? "fail" : "error",
      message,
      ...extra,
      // Melhoria (Fase 8): stack só vaza se NODE_ENV === "development"
      ...(emDesenvolvimento && { stack: err.stack }),
    });

  // Dados inválidos barrados pelo Zod (atividade 8) -> 400
  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
    return responder(400, errors.join("; "), { errors });
  }

  // Erros previstos lançados por nós (401, 403, 404, 409, 429...)
  if (err instanceof AppError) {
    return responder(err.statusCode, err.message);
  }

  // Valor repetido em campo único (email ou placa já cadastrados) -> 409
  if (err.name === "SequelizeUniqueConstraintError") {
    const campos = err.errors.map((e) => e.path).join(", ");
    return responder(409, `Registro duplicado: ${campos} já cadastrado.`);
  }

  // Regra do model violada (ex.: nota fora de 1 a 5) -> 400
  if (err.name === "SequelizeValidationError") {
    return responder(400, err.errors.map((e) => e.message).join(", "));
  }

  // Referência a um registro que não existe -> 400
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return responder(400, "Registro relacionado não existe.");
  }

  // JSON mal escrito no corpo do pedido -> 400
  if (err.type === "entity.parse.failed") {
    return responder(400, "JSON inválido no corpo da requisição.");
  }

  // Qualquer outra coisa: falha inesperada -> 500, sem vazar detalhes
  // Em produção, o console.error envia o erro para os logs da plataforma (Vercel)
  console.error("[500]", err);
  return responder(500, "Algo deu errado no servidor.");
};

export default errorMiddleware;
