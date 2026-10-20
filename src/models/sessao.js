// SESSÃO: registra cada login feito. Não é uma das 4 entidades do tema;
// existe para o LOGOUT funcionar de verdade.
//
// Como funciona: no login, criamos uma sessão e colocamos o id dela dentro do token.
// Em cada pedido, o middleware de autenticação confere se essa sessão ainda existe.
// No logout, apagamos a sessão: o token continua "bonito", mas para de funcionar.
const getSessaoModel = (sequelize, { DataTypes }) => {
  const Sessao = sequelize.define(
    "sessao",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Até quando o login vale
      expiraEm: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { tableName: "sessoes" },
  );

  Sessao.associate = (models) => {
    Sessao.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "usuario" });
  };

  return Sessao;
};

export default getSessaoModel;
