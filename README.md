# Caronas Universitárias API

Back-end em **Express + PostgreSQL (NeonDB)** para uma plataforma de caronas entre estudantes universitários.
Projeto da disciplina de Aplicações Orientadas a Serviços (UNICAP, 2026.2).

## Equipe

<!-- Cada integrante adiciona a própria linha (nome e RA) pelo GitHub e faz o commit -->

| Nome | RA |
|---|---|
| Ivanise Lima | |
| André Madruga | |


## Modelo de dados

| Entidade | Campos principais | Dono do registro |
|---|---|---|
| Usuário | nome, email, senha (criptografada com Argon2), curso, telefone, role (USER ou ADMIN) | o próprio usuário |
| Veículo | modelo, cor, placa, lugares | `usuarioId` |
| Carona | origem, destino, dataHora, vagas, valor, observacao | `motoristaId` |
| Reserva | lugares, status (pendente, confirmada, cancelada) | `passageiroId` |
| Avaliação | nota (1 a 5), comentario | `autorId` |

Relacionamentos acessados por URL composta:

- `/caronas/:id/reservas`: reservas de uma carona
- `/caronas/:id/avaliacoes`: avaliações de uma carona


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
validação de variáveis de ambiente e de requisições com Zod, senhas com Argon2, JWT + refresh token com rotação,
RBAC (USER/ADMIN) e verificação de dono em cada alteração.

## Como rodar

1. `npm install`
2. Copie o `.env.sample` para `.env` e preencha:
   - `DATABASE_URL`: connection string do Neon (banco da equipe) ou, para testar local, `postgresql://postgres:dev@localhost:5432/caronas?sslmode=disable`
   - `JWT_SECRET`: texto aleatório com 10 caracteres ou mais (`openssl rand -hex 32`)
   - `ALLOWED_ORIGINS`: origens liberadas no CORS, separadas por vírgula
   - `NODE_ENV` e `PORT` (a porta padrão é 3000)
3. Primeira vez (cria as tabelas **e** os dados iniciais, **apagando o que houver**):
   `ERASE_DATABASE_ON_SYNC=true npm run dev`
   Em banco compartilhado, só uma pessoa roda isso, uma única vez.
4. No dia a dia: `npm run dev`

Banco local com Docker (opcional):

    docker run --name caronas-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=caronas -p 5432:5432 -d postgres:16

Nas sessões seguintes, ligue o container com `docker start caronas-pg`.

## Dados iniciais (para testes)

| Usuário | Email | Senha | Papel |
|---|---|---|---|
| Administrador | admin@caronas.com | admin12345 | ADMIN |
| Ivanise Lima | ivanise@unicap.br | senha12345 | USER (motorista) |
| João Pedro | joao@unicap.br | senha12345 | USER (motorista e passageiro) |
| Maria Clara | maria@unicap.br | senha12345 | USER (passageira) |

Mais 2 veículos, 2 caronas, 3 reservas e 3 avaliações.

## Testes

Importe `caronas-universitarias.postman_collection.json` no Postman. Rode um dos pedidos de login: o token é salvo sozinho na variável `token` da coleção.

Observações:

- O token de acesso vale 15 minutos. Se der 401, rode o login de novo.
- O login tem limite de 5 tentativas a cada 15 minutos (erro 429). Reiniciar o servidor zera o contador.
- As senhas da seção anterior são só para desenvolvimento. Troque-as antes de qualquer uso real.
