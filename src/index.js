// Ponto de entrada da API
import "dotenv/config"; // 1º: carrega o .env
import { env } from "./utils/index.js"; // 2º: valida as variáveis (fail-fast, atividade 7)
import express from "express";
import helmet from "helmet";
import { sequelize } from "./models/index.js";
import {
  corsMiddleware,
  limiterMiddleware,
  logMiddleware,
  authMiddleware,
  protectRoutes,
  notFoundMiddleware,
  errorMiddleware,
} from "./middlewares/index.js";
import * as routes from "./routes/index.js";
import criarDadosIniciais from "./utils/seed.js";

const app = express();

app.set("trust proxy", true); // a Vercel fica na frente da API (proxy)

// ---------- middlewares: rodam em TODO pedido, nesta ordem ----------
app.use(helmet()); // atividade 5: cabeçalhos de segurança (e esconde o "X-Powered-By: Express")
app.use(corsMiddleware); // atividade 5: quais sites podem chamar a API
app.use(limiterMiddleware); // atividade 6: no máximo 100 pedidos por IP a cada 15 min
app.use(express.json()); // transforma o corpo JSON em req.body
app.use(logMiddleware);
app.use(authMiddleware); // atividade 9: descobre quem está logado (req.context.me)
app.use(protectRoutes); // fora das rotas públicas, exige login

// ---------- rotas ----------
app.get("/", (req, res) => res.status(200).send({ message: "API de Caronas Universitárias no ar" }));
app.use("/session", routes.session); // login, refresh, logout
app.use("/usuarios", routes.usuario); // sign up e cadastro
// app.use("/veiculos", routes.veiculo);
// app.use("/caronas", routes.carona); // + /caronas/:caronaId/reservas e /avaliacoes

// ---------- erros: sempre DEPOIS das rotas ----------
app.use(notFoundMiddleware); // nenhuma rota respondeu -> 404
app.use(errorMiddleware); // atividade 4: todo erro vira JSON padronizado

// ---------- inicialização ----------
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === "true";
const syncDatabase = process.env.SYNC_DATABASE === "true" || eraseDatabaseOnSync;

const startServer = () => {
  app.listen(env.PORT, () => console.log(`Servidor rodando na porta ${env.PORT}`));
};

if (syncDatabase) {
  sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) await criarDadosIniciais();
    startServer();
  });
} else {
  startServer();
}

export default app;
