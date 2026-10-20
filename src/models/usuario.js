// USUÁRIO: quem usa a API. Pode ser motorista (oferece caronas)
// e passageiro (reserva caronas) ao mesmo tempo.
import bcrypt from "bcryptjs";

const getUsuarioModel = (sequelize, { DataTypes }) => {
  const Usuario = sequelize.define(
    "usuario",
    {
      // UUID: identificador aleatório e difícil de adivinhar (padrão do professor)
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "nome é obrigatório" } },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: "email inválido" } },
      },
      // Guarda a senha CRIPTOGRAFADA (o hash), nunca a senha em texto. Ver etapa 2.
      senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: { args: [6, 100], msg: "senha deve ter no mínimo 6 caracteres" },
        },
      },
      curso: {
        type: DataTypes.STRING,
      },
      telefone: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "usuarios",
      // Por padrão, a senha NUNCA sai nas consultas...
      defaultScope: { attributes: { exclude: ["senha"] } },
      // ...só quando pedimos explicitamente (usado no login)
      scopes: { comSenha: { attributes: { include: ["senha"] } } },
      // Hooks: funções que o Sequelize executa automaticamente em certos momentos
      hooks: {
        // Antes de salvar um usuário novo, troca a senha pelo hash.
        // O hash é uma "impressão digital" da senha: não dá para voltar ao texto original.
        beforeCreate: async (usuario) => {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        },
        // Se a senha for alterada depois, criptografa a nova também
        beforeUpdate: async (usuario) => {
          if (usuario.changed("senha")) {
            usuario.senha = await bcrypt.hash(usuario.senha, 10);
          }
        },
      },
    },
  );

  // Confere se a senha digitada no login corresponde ao hash guardado
  Usuario.prototype.senhaCorreta = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
  };

  // Ao transformar o usuário em JSON (resposta da API), remove a senha
  Usuario.prototype.toJSON = function () {
    const dados = { ...this.get() };
    delete dados.senha;
    return dados;
  };

  Usuario.associate = (models) => {
    // Um usuário tem vários veículos (é o dono deles)
    Usuario.hasMany(models.Veiculo, { foreignKey: "usuarioId", as: "veiculos", onDelete: "CASCADE" });
    // Um usuário oferece várias caronas (como motorista)
    Usuario.hasMany(models.Carona, { foreignKey: "motoristaId", as: "caronas", onDelete: "CASCADE" });
    // Um usuário faz várias reservas (como passageiro)
    Usuario.hasMany(models.Reserva, { foreignKey: "passageiroId", as: "reservas", onDelete: "CASCADE" });
    // Sessões abertas por login (usadas no logout)
    Usuario.hasMany(models.Sessao, { foreignKey: "usuarioId", as: "sessoes", onDelete: "CASCADE" });
    // Um usuário escreve várias avaliações
    Usuario.hasMany(models.Avaliacao, { foreignKey: "autorId", as: "avaliacoes", onDelete: "CASCADE" });
  };

  return Usuario;
};

export default getUsuarioModel;
