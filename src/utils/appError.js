// ATIVIDADE 4 — Classe AppError
// Erro "esperado" da aplicação: algo que nós mesmos decidimos recusar
// (registro não encontrado, sem permissão, login errado...).
// Ele carrega o código HTTP que deve ser devolvido ao cliente.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // 4xx = o erro é de quem fez o pedido ("fail"); 5xx = o erro é do servidor ("error")
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Marca que é um erro previsto pela regra de negócio, e não uma falha inesperada
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
