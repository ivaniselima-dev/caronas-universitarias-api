// ATIVIDADE 7 — Validação das variáveis de ambiente no startup com Zod
// Princípio "fail-fast": se faltar alguma configuração essencial, o servidor
// NEM SOBE. É melhor parar logo na inicialização, com uma mensagem clara,
// do que quebrar depois, no meio de um pedido de um usuário.
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL é obrigatória e deve ser uma URL válida"),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ALLOWED_ORIGINS: z
    .string("ALLOWED_ORIGINS é obrigatória")
    .min(1, "ALLOWED_ORIGINS é obrigatória"),
  JWT_SECRET: z
    .string("JWT_SECRET é obrigatório")
    .min(10, "JWT_SECRET deve ter no mínimo 10 caracteres"),
});

const result = envSchema.safeParse({
  ...process.env,
  // fallback pedido na atividade: se não houver JWT_SECRET, usa MY_SECRET
  JWT_SECRET: process.env.JWT_SECRET || process.env.MY_SECRET,
});

if (!result.success) {
  console.error("❌ Variáveis de ambiente faltando ou inválidas:");
  result.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1); // encerra o processo com código de erro
}

// Daqui em diante, o resto do código usa "env" já validado e com valores padrão
export const env = result.data;
