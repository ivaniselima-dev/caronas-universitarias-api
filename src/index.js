import "dotenv/config";
import express from "express";
import { sequelize } from "./models/index.js";
import {
  corsMiddleware,
  logMiddleware,
  authMiddleware,
  notFoundMiddleware,
  errorMiddleware,
} from "./middlewares/index.js";
import * as routes from "./routes/index.js";

const app = express();

app.set("trust proxy", true);

// ---------- middlewares: rodam em TODO pedido, nesta ordem ----------
app.use(corsMiddleware);
app.use(express.json()); // transforma o corpo JSON em req.body
app.use(logMiddleware);

// ---------- rotas públicas (não exigem login) ----------
app.get("/", (req, res) => {
  return res.send({ message: "API de Caronas Universitárias no ar" });
});
app.use("/auth", routes.auth); // signup e login (logout e me exigem login lá dentro)

// ---------- a partir daqui, TUDO exige login ----------
app.use(authMiddleware);
// (as rotas das entidades entram na etapa 3, abaixo desta linha)

// ---------- tratamento de erros: sempre DEPOIS das rotas ----------
app.use(notFoundMiddleware); // nenhuma rota respondeu -> 404
app.use(errorMiddleware); // qualquer erro lançado vem parar aqui

// ---------- inicialização ----------
const port = process.env.PORT || 3000;

// SYNC_DATABASE=true          -> cria as tabelas que faltam
// ERASE_DATABASE_ON_SYNC=true -> apaga tudo e recria (use só quando quiser zerar o banco)
const eraseDatabaseOnSync = process.env.ERASE_DATABASE_ON_SYNC === "true";
const syncDatabase = process.env.SYNC_DATABASE === "true" || eraseDatabaseOnSync;

const startServer = () => {
  app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
};

if (syncDatabase) {
  sequelize.sync({ force: eraseDatabaseOnSync }).then(startServer);
} else {
  startServer();
}

export default app;
