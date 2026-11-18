// USUÁRIO: quem usa a API. Pode ser motorista (oferece caronas)
// e passageiro (reserva caronas) ao mesmo tempo.
import argon2 from "argon2";

// Reconhece um texto que já é um hash do Argon2 (para não criptografar duas vezes)
const ehHashArgon2 = (valor) => typeof valor === "string" && valor.startsWith("$argon2");

const getUsuarioModel = (sequelize, { DataTypes }) => {
  const Usuario = sequelize.define(
    "usuario",
    {
      // UUID: identificador aleatório e difícil de adivinhar
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
      // ATIVIDADE 9 — guarda o HASH da senha (Argon2), nunca a senha em texto
      senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          tamanho(valor) {
            if (ehHashArgon2(valor)) return; // já criptografada
            if (!valor || valor.length < 7 || valor.length > 42) {
              throw new Error("senha deve ter entre 7 e 42 caracteres");
            }
          },
        },
      },
      // ATIVIDADE RBAC — papel do usuário. Todo cadastro novo nasce como USER.
      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        allowNull: false,
        defaultValue: "USER",
      },
      curso: {
        type: DataTypes.STRING,
      },
      telefone: {
        type: DataTypes.STRING,
      },
    },
    { tableName: "usuarios" },
  );

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Veiculo, { foreignKey: "usuarioId", as: "veiculos", onDelete: "CASCADE" });
    Usuario.hasMany(models.Carona, { foreignKey: "motoristaId", as: "caronas", onDelete: "CASCADE" });
    Usuario.hasMany(models.Reserva, { foreignKey: "passageiroId", as: "reservas", onDelete: "CASCADE" });
    Usuario.hasMany(models.Avaliacao, { foreignKey: "autorId", as: "avaliacoes", onDelete: "CASCADE" });
    Usuario.hasMany(models.RefreshToken, { foreignKey: "usuarioId", onDelete: "CASCADE" });
  };

  // ATIVIDADE 9 — Hooks: o Sequelize roda isto sozinho antes de salvar.
  // A senha digitada vira hash Argon2, uma "impressão digital" que não dá para reverter.
  Usuario.beforeCreate(async (usuario) => {
    if (!ehHashArgon2(usuario.senha)) {
      usuario.senha = await argon2.hash(usuario.senha);
    }
  });
  Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed("senha") && !ehHashArgon2(usuario.senha)) {
      usuario.senha = await argon2.hash(usuario.senha);
    }
  });

  // Confere se a senha digitada no login corresponde ao hash guardado
  Usuario.prototype.validarSenha = async function (senhaDigitada) {
    return await argon2.verify(this.senha, senhaDigitada);
  };

  // A senha (mesmo o hash) NUNCA sai nas respostas da API
  Usuario.prototype.toJSON = function () {
    const dados = { ...this.get() };
    delete dados.senha;
    return dados;
  };

  return Usuario;
};

export default getUsuarioModel;
