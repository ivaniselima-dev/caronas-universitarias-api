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
app.get("/", (req, res) => res.status(200).send({ status: "success", message: "API de Caronas Universitárias no ar 🚗" }));

// Rota de Healthcheck: monitora saúde da aplicação e integridade da conexão com o banco
app.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await sequelize.authenticate();
  } catch {
    dbStatus = "disconnected";
  }
  return res.status(200).send({
    status: "success",
    data: {
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: env.NODE_ENV,
    },
  });
});

app.use("/session", routes.session); // login, refresh, logout
app.use("/usuarios", routes.usuario); // sign up e cadastro
app.use("/veiculos", routes.veiculo);
app.use("/caronas", routes.carona); // + /caronas/:caronaId/reservas e /avaliacoes

// ---------- erros: sempre DEPOIS das rotas ----------
app.use(notFoundMiddleware); // nenhuma rota respondeu -> 404
app.use(errorMiddleware); // atividade 4: todo erro vira JSON padronizado

// ---------- inicialização ----------
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === "true";
const syncDatabase = process.env.SYNC_DATABASE === "true" || eraseDatabaseOnSync;

// Melhoria (Fase 8): tratamento de erros de rede e encerramento gracioso
const startServer = () => {
  const server = app.listen(env.PORT, () =>
    console.log(`✅ Servidor rodando na porta ${env.PORT} [${env.NODE_ENV}]`),
  );

  // Trata erros de rede (ex.: porta já em uso) sem derrubar o processo com um stack cru
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Porta ${env.PORT} já está em uso.`);
    } else {
      console.error("❌ Erro no servidor:", err.message);
    }
    process.exit(1);
  });

  // Encerramento gracioso: aguarda as conexões abertas antes de sair (ex.: Vercel / Docker)
  const shutdown = (sinal) => {
    console.log(`\n⏳ Recebido ${sinal}. Encerrando servidor...`);
    server.close(() => {
      console.log("✅ Servidor encerrado com sucesso.");
      process.exit(0);
    });
    // Força encerramento após 10 s caso haja conexões presas
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
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
