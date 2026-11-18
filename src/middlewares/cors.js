// ATIVIDADE 5 — CORS limpo para web e mobile
// CORS decide quais SITES (front-ends no navegador) podem chamar esta API.
import cors from "cors";
import { env } from "../utils/index.js";

// Lista de origens permitidas, vinda do .env (separadas por vírgula)
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

const corsMiddleware = cors({
  origin(origin, callback) {
    // Sem cabeçalho Origin = app mobile (Expo/React Native), Postman ou cURL: liberado
    if (!origin) return callback(null, true);
    // Site da lista: liberado
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Qualquer outro site: o navegador bloqueia. Não lançamos erro para não poluir os logs.
    return callback(null, false);
  },
  credentials: true,
});

export default corsMiddleware;
