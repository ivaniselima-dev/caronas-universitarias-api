// USUÁRIO: quem usa a API. Pode ser motorista (oferece caronas)
// e passageiro (reserva caronas) ao mesmo tempo.
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
    },
  );

  Usuario.associate = (models) => {
    // Um usuário tem vários veículos (é o dono deles)
    Usuario.hasMany(models.Veiculo, { foreignKey: "usuarioId", as: "veiculos", onDelete: "CASCADE" });
    // Um usuário oferece várias caronas (como motorista)
    Usuario.hasMany(models.Carona, { foreignKey: "motoristaId", as: "caronas", onDelete: "CASCADE" });
    // Um usuário faz várias reservas (como passageiro)
    Usuario.hasMany(models.Reserva, { foreignKey: "passageiroId", as: "reservas", onDelete: "CASCADE" });
    // Um usuário escreve várias avaliações
    Usuario.hasMany(models.Avaliacao, { foreignKey: "autorId", as: "avaliacoes", onDelete: "CASCADE" });
  };

  return Usuario;
};

export default getUsuarioModel;
