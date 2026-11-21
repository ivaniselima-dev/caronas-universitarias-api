// ATIVIDADE 9 — Autenticação com JWT
// ATIVIDADE RBAC — Controle de acesso por papel (USER/ADMIN) e por propriedade
import jwt from "jsonwebtoken";
import { env, AppError } from "../utils/index.js";
import {
  usuarioService,
  veiculoService,
  caronaService,
  reservaService,
  avaliacaoService,
} from "../services/index.js";

// Rotas que funcionam SEM login (todo o resto exige)
const ROTAS_PUBLICAS = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/health" },
  { method: "HEAD", path: "/" },
  { method: "POST", path: "/usuarios" }, // sign up
  { method: "POST", path: "/session" }, // login
  { method: "POST", path: "/session/refresh" }, // renovar sessão
  { method: "DELETE", path: "/session" }, // logout
];

const ehRotaPublica = (req) => {
  if (req.method === "OPTIONS") return true; // preflight do CORS
  const caminho = req.path.replace(/\/+$/, "") || "/";
  return ROTAS_PUBLICAS.some((r) => r.method === req.method && r.path === caminho);
};

// 1) Lê o token do cabeçalho "Authorization: Bearer <token>" e descobre quem é o usuário.
//    O usuário logado fica em req.context.me para o resto da aplicação.
export const authMiddleware = async (req, res, next) => {
  req.context = { me: null };

  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith("Bearer ")) return next();

  let dados;
  try {
    dados = jwt.verify(cabecalho.slice(7).trim(), env.JWT_SECRET);
  } catch {
    if (ehRotaPublica(req)) return next();
    throw new AppError("Token inválido ou expirado.", 401);
  }

  req.context.me = await usuarioService.buscarPorId(dados.id);
  next();
};

// 2) Porteiro: fora das rotas públicas, só passa quem está logado
export const protectRoutes = (req, res, next) => {
  if (ehRotaPublica(req)) return next();
  if (!req.context?.me) {
    throw new AppError("Token de autenticação não fornecido.", 401);
  }
  next();
};

// 3) RBAC: só deixa passar quem tem um dos papéis informados. Ex.: restrictTo("ADMIN")
export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.context?.me || !roles.includes(req.context.me.role)) {
    throw new AppError("Você não tem permissão para executar esta ação.", 403);
  }
  next();
};

const ehAdmin = (req) => req.context.me.role === "ADMIN";

// 4) PROPRIEDADE: fábrica que monta um middleware "só o dono (ou um ADMIN) pode".
//    Busca o registro, devolve 404 se não existir, 403 se não for do usuário logado,
//    e guarda o registro em req[guardarEm] para o controller não buscar de novo.
const verificarDono = ({ buscar, campoDono, naoEncontrado, semPermissao, guardarEm, tambemPode }) =>
  async (req, res, next) => {
    const registro = await buscar(req);
    if (!registro) throw new AppError(naoEncontrado, 404);

    const ehDono = registro[campoDono] === req.context.me.id;
    const liberadoPorRegra = tambemPode ? tambemPode(req, registro) : false;
    if (!ehDono && !liberadoPorRegra && !ehAdmin(req)) {
      throw new AppError(semPermissao, 403);
    }

    req[guardarEm] = registro;
    next();
  };

// Só o próprio usuário (ou um ADMIN) altera/apaga um cadastro
export const isUsuarioOwner = (req, res, next) => {
  if (req.params.usuarioId !== req.context.me.id && !ehAdmin(req)) {
    throw new AppError("Você não tem permissão para modificar o cadastro de outro usuário.", 403);
  }
  next();
};

export const isVeiculoOwner = verificarDono({
  buscar: (req) => veiculoService.buscarPorId(req.params.veiculoId),
  campoDono: "usuarioId",
  naoEncontrado: "Veículo não encontrado.",
  semPermissao: "Você não tem permissão para acessar o veículo de outro usuário.",
  guardarEm: "veiculo",
});

export const isCaronaOwner = verificarDono({
  buscar: (req) => caronaService.buscarPorId(req.params.caronaId),
  campoDono: "motoristaId",
  naoEncontrado: "Carona não encontrada.",
  semPermissao: "Você não tem permissão para alterar ou remover caronas de outros usuários.",
  guardarEm: "carona",
});

// Nas URLs compostas (/caronas/:caronaId/...), primeiro carregamos a carona do endereço
export const carregarCarona = async (req, res, next) => {
  const carona = await caronaService.buscarPorId(req.params.caronaId);
  if (!carona) throw new AppError("Carona não encontrada.", 404);
  req.carona = carona;
  next();
};

// Para VER uma reserva: o passageiro, o motorista da carona ou um ADMIN
export const podeVerReserva = verificarDono({
  buscar: (req) => reservaService.buscarDaCarona(req.carona.id, req.params.reservaId),
  campoDono: "passageiroId",
  naoEncontrado: "Reserva não encontrada.",
  semPermissao: "Você não tem permissão para ver a reserva de outro usuário.",
  guardarEm: "reserva",
  tambemPode: (req) => req.carona.motoristaId === req.context.me.id,
});

// Para ALTERAR/APAGAR uma reserva: só o passageiro dono ou um ADMIN
export const isReservaOwner = verificarDono({
  buscar: (req) => reservaService.buscarDaCarona(req.carona.id, req.params.reservaId),
  campoDono: "passageiroId",
  naoEncontrado: "Reserva não encontrada.",
  semPermissao: "Você não tem permissão para alterar ou remover reservas de outros usuários.",
  guardarEm: "reserva",
});

export const isAvaliacaoOwner = verificarDono({
  buscar: (req) => avaliacaoService.buscarDaCarona(req.carona.id, req.params.avaliacaoId),
  campoDono: "autorId",
  naoEncontrado: "Avaliação não encontrada.",
  semPermissao: "Você não tem permissão para alterar ou remover avaliações de outros usuários.",
  guardarEm: "avaliacao",
});
