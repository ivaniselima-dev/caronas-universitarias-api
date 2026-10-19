// AVALIAÇÃO: nota e comentário de um usuário sobre uma carona.
const getAvaliacaoModel = (sequelize, { DataTypes }) => {
  const Avaliacao = sequelize.define(
    "avaliacao",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: "nota deve ser de 1 a 5" },
          max: { args: [5], msg: "nota deve ser de 1 a 5" },
        },
      },
      comentario: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "avaliacoes" },
  );

  Avaliacao.associate = (models) => {
    Avaliacao.belongsTo(models.Carona, { foreignKey: "caronaId", as: "carona" });
    // autorId: quem escreveu. Só ele pode alterar ou apagar.
    Avaliacao.belongsTo(models.Usuario, { foreignKey: "autorId", as: "autor" });
  };

  return Avaliacao;
};

export default getAvaliacaoModel;
