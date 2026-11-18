// ATIVIDADE 2 — Barrel Pattern
// Este index.js "reexporta" o que está nos arquivos da pasta.
// Assim, quem precisa importa de um lugar só: import { AppError, env } from "../utils/index.js"
export { default as AppError } from "./appError.js";
export { env } from "./env.js";
