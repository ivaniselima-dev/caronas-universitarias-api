// ATIVIDADE 6 — Limitação de taxa de requisições (express-rate-limit)
// Protege contra abuso, sobrecarga (DoS) e tentativas de adivinhar senhas (força bruta).
import rateLimit from "express-rate-limit";
import { AppError } from "../utils/index.js";

const QUINZE_MINUTOS = 15 * 60 * 1000;

// Limite GERAL: 100 pedidos por IP a cada 15 minutos
export const limiterMiddleware = rateLimit({
  windowMs: QUINZE_MINUTOS,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { trustProxy: false },
  // Em vez de responder direto, entrega um AppError 429 ao middleware de erro (resposta padronizada)
  handler: (req, res, next) =>
    next(new AppError("Muitas requisições originadas deste IP. Tente novamente em 15 minutos.", 429)),
});

// Limite do LOGIN: só 5 tentativas a cada 15 minutos (contra força bruta)
export const authLimiterMiddleware = rateLimit({
  windowMs: QUINZE_MINUTOS,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: (req, res, next) =>
    next(new AppError("Muitas tentativas de autenticação originadas deste IP. Tente novamente em 15 minutos.", 429)),
});
