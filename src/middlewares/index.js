// Barrel Pattern: reexporta todos os middlewares da pasta
export { default as corsMiddleware } from "./cors.js";
export { default as logMiddleware } from "./log.js";
export { limiterMiddleware, authLimiterMiddleware } from "./rateLimiter.js";
export {
  authMiddleware,
  protectRoutes,
  restrictTo,
  isUsuarioOwner,
  isVeiculoOwner,
  isCaronaOwner,
  carregarCarona,
  podeVerReserva,
  isReservaOwner,
  isAvaliacaoOwner,
} from "./auth.js";
export { default as validate } from "./validate.js";
export * from "./validationSchemas.js";
export { default as notFoundMiddleware } from "./notFound.js";
export { default as errorMiddleware } from "./error.js";
