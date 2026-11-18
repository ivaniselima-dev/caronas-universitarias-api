// ATIVIDADE 8 — Schemas (regras) de validação de cada rota
// O Zod descarta campos que não estão no schema: por isso ninguém consegue,
// por exemplo, mandar "role":"ADMIN" no cadastro ou trocar o dono de um registro.
import { z } from "zod";

const uuid = (campo) => z.uuid(`${campo} deve ser um UUID válido`);

// Exige pelo menos um campo num update (PUT vazio não faz sentido)
const algumCampo = (schema) =>
  schema.refine((dados) => Object.keys(dados).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

// ---------- parâmetros da URL ----------
export const usuarioIdParamSchema = z.object({ params: z.object({ usuarioId: uuid("usuarioId") }) });
export const veiculoIdParamSchema = z.object({ params: z.object({ veiculoId: uuid("veiculoId") }) });
export const caronaIdParamSchema = z.object({ params: z.object({ caronaId: uuid("caronaId") }) });
export const reservaIdParamSchema = z.object({
  params: z.object({ caronaId: uuid("caronaId"), reservaId: uuid("reservaId") }),
});
export const avaliacaoIdParamSchema = z.object({
  params: z.object({ caronaId: uuid("caronaId"), avaliacaoId: uuid("avaliacaoId") }),
});

// ---------- sessão ----------
export const loginSchema = z.object({
  body: z.object({
    email: z.email("email inválido"),
    senha: z.string("senha é obrigatória").min(1, "senha é obrigatória"),
  }),
});
export const refreshTokenSchema = z.object({
  body: z.object({ refreshToken: z.string("refreshToken é obrigatório").min(1, "refreshToken é obrigatório") }),
});

// ---------- usuários ----------
const senha = z.string("senha é obrigatória").min(7, "senha deve ter entre 7 e 42 caracteres").max(42, "senha deve ter entre 7 e 42 caracteres");
export const createUsuarioSchema = z.object({
  body: z.object({
    nome: z.string("nome é obrigatório").trim().min(1, "nome é obrigatório"),
    email: z.email("email inválido"),
    senha,
    curso: z.string().optional(),
    telefone: z.string().optional(),
  }),
});
export const updateUsuarioSchema = z.object({
  body: algumCampo(
    z.object({
      nome: z.string().trim().min(1, "nome não pode ser vazio").optional(),
      email: z.email("email inválido").optional(),
      senha: senha.optional(),
      curso: z.string().optional(),
      telefone: z.string().optional(),
      // aceito aqui só para o controller conferir se quem pede é ADMIN
      role: z.enum(["USER", "ADMIN"], "role deve ser USER ou ADMIN").optional(),
    }),
  ),
});

// ---------- veículos ----------
const veiculo = {
  modelo: z.string("modelo é obrigatório").trim().min(1, "modelo é obrigatório"),
  cor: z.string().optional(),
  placa: z.string("placa é obrigatória").trim().toUpperCase().min(7, "placa inválida").max(8, "placa inválida"),
  lugares: z.coerce.number("lugares é obrigatório").int().min(1, "lugares deve ser de 1 a 8").max(8, "lugares deve ser de 1 a 8"),
};
export const createVeiculoSchema = z.object({ body: z.object(veiculo) });
export const updateVeiculoSchema = z.object({ body: algumCampo(z.object(veiculo).partial()) });

// ---------- caronas ----------
const carona = {
  origem: z.string("origem é obrigatória").trim().min(1, "origem é obrigatória"),
  destino: z.string("destino é obrigatório").trim().min(1, "destino é obrigatório"),
  dataHora: z.coerce.date("dataHora deve ser uma data válida"),
  vagas: z.coerce.number("vagas é obrigatório").int().min(1, "vagas deve ser no mínimo 1"),
  valor: z.coerce.number().min(0, "valor não pode ser negativo").optional(),
  observacao: z.string().max(500).optional(),
  veiculoId: uuid("veiculoId"),
};
export const createCaronaSchema = z.object({ body: z.object(carona) });
export const updateCaronaSchema = z.object({ body: algumCampo(z.object(carona).partial()) });

// ---------- reservas (relacionamento 1) ----------
export const createReservaSchema = z.object({
  body: z.object({ lugares: z.coerce.number().int().min(1, "lugares deve ser no mínimo 1").optional() }),
});
export const updateReservaSchema = z.object({
  body: algumCampo(
    z.object({
      lugares: z.coerce.number().int().min(1, "lugares deve ser no mínimo 1").optional(),
      status: z.enum(["pendente", "confirmada", "cancelada"], "status deve ser pendente, confirmada ou cancelada").optional(),
    }),
  ),
});

// ---------- avaliações (relacionamento 2) ----------
const avaliacao = {
  nota: z.coerce.number("nota é obrigatória").int().min(1, "nota deve ser de 1 a 5").max(5, "nota deve ser de 1 a 5"),
  comentario: z.string().max(1000, "comentario deve ter no máximo 1000 caracteres").optional(),
};
export const createAvaliacaoSchema = z.object({ body: z.object(avaliacao) });
export const updateAvaliacaoSchema = z.object({ body: algumCampo(z.object(avaliacao).partial()) });
