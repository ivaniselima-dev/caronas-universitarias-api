# Caronas Universitárias API

Back-end em **Express + PostgreSQL (NeonDB)** para uma plataforma de caronas entre estudantes universitários.
Projeto da disciplina de Aplicações Orientadas a Serviços (UNICAP, 2026.2).

## Equipe

| Nome | RA |
|---|---|
| Ivanise Lima | _(preencher)_ |
| André Madruga | _(preencher)_ |


## Modelo de dados

| Entidade | Campos principais | Dono do registro |
|---|---|---|
| Usuário | nome, email, senha (Argon2), curso, telefone, role (USER \| ADMIN) | o próprio usuário |
| Veículo | modelo, cor, placa (formato antigo ou Mercosul), lugares | `usuarioId` |
| Carona | origem, destino, dataHora, vagas, valor, observacao | `motoristaId` |
| Reserva | lugares, status (pendente \| confirmada \| cancelada) | `passageiroId` |
| Avaliação | nota (1–5), comentario | `autorId` |

Relacionamentos acessados por URL composta:

- `/caronas/:id/reservas` — Relacionamento 1
- `/caronas/:id/avaliacoes` — Relacionamento 2


## Rotas

Todas exigem login (`Authorization: Bearer <token>`), exceto as marcadas como públicas.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/usuarios` | **Sign up** (público) |
| POST | `/session` | **Login** (público): devolve `token` (15 min) e `refreshToken` (7 dias) |
| POST | `/session/refresh` | Renova a sessão com rotação do refresh token (público) |
| DELETE | `/session` | **Logout** (público, com o `refreshToken` no corpo) |
| GET | `/session` | Dados do usuário logado |
| GET, PUT, DELETE | `/usuarios/:usuarioId` | Ver, alterar e apagar cadastro (alterar/apagar: só o próprio ou ADMIN) |
| GET | `/usuarios` | Lista todos (só ADMIN) |
| GET, POST | `/veiculos` | Listar (cada usuário vê os seus; ADMIN vê todos) e cadastrar |
| GET, PUT, DELETE | `/veiculos/:veiculoId` | Só o dono ou ADMIN |
| GET, POST | `/caronas` | Listar todas e oferecer uma carona |
| GET, PUT, DELETE | `/caronas/:caronaId` | Alterar/apagar: só o motorista ou ADMIN |
| GET, POST | `/caronas/:caronaId/reservas` | **Relacionamento 1** (URL composta) |
| GET, PUT, DELETE | `/caronas/:caronaId/reservas/:reservaId` | Alterar/apagar: só o passageiro ou ADMIN |
| GET, POST | `/caronas/:caronaId/avaliacoes` | **Relacionamento 2** (URL composta) |
| GET, PUT, DELETE | `/caronas/:caronaId/avaliacoes/:avaliacaoId` | Alterar/apagar: só o autor ou ADMIN |

## Segurança

Helmet, CORS por lista de origens, limite de 100 pedidos / 15 min por IP (5 tentativas de login / 15 min),
validação de variáveis de ambiente e de requisições com Zod, senhas com Argon2, JWT (15 min) + refresh token
com rotação (7 dias), RBAC (USER/ADMIN) e verificação de dono em cada alteração.

Regras de negócio adicionais:
- Passageiro não pode ter duas reservas ativas na mesma carona.
- Usuário não pode avaliar a mesma carona duas vezes.
- Placa do veículo é validada nos formatos antigo (ABC-1234) e Mercosul (ABC1D23).


## Como rodar localmente

```bash
npm install
cp .env.sample .env   # edite com suas configurações
```

Variáveis do `.env`:

| Variável | Exemplo |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | texto aleatório ≥ 10 chars (`openssl rand -hex 32`) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` |
| `NODE_ENV` | `development` |
| `PORT` | `3000` |

**Primeira vez** (cria tabelas e dados iniciais — apaga o banco existente):

```bash
ERASE_DATABASE_ON_SYNC=true npm run dev
```

> Em banco compartilhado, **apenas uma pessoa** executa este comando, **uma única vez**.

**Uso diário:**

```bash
npm run dev
```

**Banco local com Docker (opcional):**

```bash
docker run --name caronas-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=caronas -p 5432:5432 -d postgres:16
# Nas sessões seguintes:
docker start caronas-pg
```

Use `DATABASE_URL=postgresql://postgres:dev@localhost:5432/caronas?sslmode=disable` no `.env` local.


## Deploy na Vercel

1. Faça o push para a branch `main` no GitHub.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Configure as variáveis de ambiente no painel da Vercel:
   - `DATABASE_URL` (NeonDB — connection string com `sslmode=require`)
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (URL do seu front-end ou `*` para testes)
   - `NODE_ENV=production`
4. O deploy é automático a cada push na `main`.

> O `vercel.json` já aponta o entry point para `src/index.js` usando `@vercel/node`.


## Dados iniciais (para testes)

| Usuário | Email | Senha | Papel |
|---|---|---|---|
| Administrador | admin@caronas.com | admin12345 | ADMIN |
| Ivanise Lima | ivanise@unicap.br | senha12345 | USER (motorista) |
| João Pedro | joao@unicap.br | senha12345 | USER (motorista e passageiro) |
| Maria Clara | maria@unicap.br | senha12345 | USER (passageira) |

Mais 2 veículos, 2 caronas, 3 reservas e 3 avaliações pré-cadastradas.

> As senhas acima são **apenas para desenvolvimento**. Nunca as use em produção.


## Testes com Postman

Importe `caronas-universitarias.postman_collection.json` no Postman.

- Execute um dos pedidos de **Login**: o `token` e o `refreshToken` são salvos automaticamente nas variáveis da coleção.
- Ajuste a variável `baseUrl` para a URL de produção após o deploy na Vercel.
- O token de acesso vale **15 minutos**. Se receber `401`, rode o login novamente.
- O login tem limite de **5 tentativas a cada 15 minutos** (erro `429`). Reiniciar o servidor zera o contador.
