import { AppError } from "../utils/index.js";

// Chega aqui todo pedido cujo endereço não bate com nenhuma rota
const notFoundMiddleware = (req, res, next) => {
  next(new AppError(`Rota ${req.originalUrl} não encontrada`, 404));
};

export default notFoundMiddleware;
