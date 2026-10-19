// Erro "esperado" da aplicação: algo que nós mesmos decidimos recusar
// (ex.: registro não encontrado, sem permissão). Ele carrega o código HTTP
// que deve ser devolvido. Mesmo padrão usado pelo professor.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // 4xx = erro de quem fez o pedido ("fail"); 5xx = erro do servidor ("error")
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
