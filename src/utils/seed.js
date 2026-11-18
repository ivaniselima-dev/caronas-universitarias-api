// OBS 3 do enunciado — dados pré-cadastrados: pelo menos 2 de cada entidade
// e 2 de cada relacionamento. Só roda quando o banco é recriado
// (ERASE_DATABASE_ON_SYNC=true). Senhas de teste: veja o README.
import models from "../models/index.js";

const criarDadosIniciais = async () => {
  const { Usuario, Veiculo, Carona, Reserva, Avaliacao } = models;

  // ---- usuários (1 ADMIN + 3 USER) ----
  const admin = await Usuario.create({ nome: "Administrador", email: "admin@caronas.com", senha: "admin12345", role: "ADMIN" });
  const ivanise = await Usuario.create({ nome: "Ivanise Lima", email: "ivanise@unicap.br", senha: "senha12345", curso: "Sistemas para Internet", telefone: "81900000001" });
  const joao = await Usuario.create({ nome: "João Pedro", email: "joao@unicap.br", senha: "senha12345", curso: "Ciência da Computação", telefone: "81900000002" });
  const maria = await Usuario.create({ nome: "Maria Clara", email: "maria@unicap.br", senha: "senha12345", curso: "Design", telefone: "81900000003" });

  // ---- veículos (2) ----
  const onix = await Veiculo.create({ modelo: "Chevrolet Onix", cor: "Prata", placa: "PEX1A23", lugares: 4, usuarioId: ivanise.id });
  const hb20 = await Veiculo.create({ modelo: "Hyundai HB20", cor: "Branco", placa: "QYZ4B56", lugares: 3, usuarioId: joao.id });

  // ---- caronas (2) ----
  const ida = await Carona.create({
    origem: "Boa Viagem", destino: "UNICAP", dataHora: "2026-12-01T18:00:00-03:00",
    vagas: 3, valor: 5, observacao: "Saio da Av. Domingos Ferreira", motoristaId: ivanise.id, veiculoId: onix.id,
  });
  const volta = await Carona.create({
    origem: "UNICAP", destino: "Olinda", dataHora: "2026-12-01T22:10:00-03:00",
    vagas: 2, valor: 0, observacao: "Saída pelo portão da Rua do Príncipe", motoristaId: joao.id, veiculoId: hb20.id,
  });

  // ---- reservas (relacionamento 1: 2 na mesma carona) ----
  await Reserva.create({ caronaId: ida.id, passageiroId: joao.id, lugares: 1, status: "confirmada" });
  await Reserva.create({ caronaId: ida.id, passageiroId: maria.id, lugares: 1, status: "pendente" });
  await Reserva.create({ caronaId: volta.id, passageiroId: maria.id, lugares: 1, status: "confirmada" });

  // ---- avaliações (relacionamento 2: 2 na mesma carona) ----
  await Avaliacao.create({ caronaId: ida.id, autorId: joao.id, nota: 5, comentario: "Pontual e muito educada." });
  await Avaliacao.create({ caronaId: ida.id, autorId: maria.id, nota: 4, comentario: "Viagem tranquila." });
  await Avaliacao.create({ caronaId: volta.id, autorId: maria.id, nota: 5, comentario: "Me deixou perto de casa." });

  console.log(`Dados iniciais criados (ADMIN: ${admin.email})`);
};

export default criarDadosIniciais;
