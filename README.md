# Caronas Universitárias API

Back-end em **Express + PostgreSQL (NeonDB)** para uma plataforma de caronas entre estudantes universitários.
Projeto da disciplina de Aplicações Orientadas a Serviços (UNICAP, 2026.2).

## Equipe

<!-- Cada integrante adiciona a própria linha (nome e RA) pelo GitHub e faz o commit -->

| Nome | RA |
|---|---|
| Ivanise Lima | |

## Modelo de dados

| Entidade | Campos principais | Dono do registro |
|---|---|---|
| Usuário | nome, email, senha (criptografada), curso, telefone | o próprio usuário |
| Veículo | modelo, cor, placa, lugares | `usuarioId` |
| Carona | origem, destino, dataHora, vagas, valor, observacao | `motoristaId` |
| Reserva | lugares, status (pendente, confirmada, cancelada) | `passageiroId` |
| Avaliação | nota (1 a 5), comentario | `autorId` |

Relacionamentos acessados por URL composta:

- `/caronas/:id/reservas`: reservas de uma carona
- `/caronas/:id/avaliacoes`: avaliações de uma carona

## Como rodar

1. `npm install`
2. Copie o `.env.sample` para `.env` e coloque a connection string do Neon em `DATABASE_URL`
3. Para criar as tabelas: `SYNC_DATABASE=true npm run dev`
4. Depois, no dia a dia: `npm run dev`
