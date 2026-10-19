// CARONA: uma viagem oferecida por um motorista, com um dos seus veículos.
// É a entidade central: as reservas e as avaliações pertencem a ela.
const getCaronaModel = (sequelize, { DataTypes }) => {
  const Carona = sequelize.define(
    "carona",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      origem: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "origem é obrigatória" } },
      },
      destino: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "destino é obrigatório" } },
      },
      // Data e horário da saída
      dataHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // Quantos lugares o motorista oferece nesta viagem
      vagas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: { args: [1], msg: "vagas deve ser no mínimo 1" } },
      },
      // Valor da contribuição por passageiro (0 = gratuita)
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      observacao: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "caronas" },
  );

  Carona.associate = (models) => {
    // motoristaId: quem oferece a carona. Só ele pode alterar ou apagar.
    Carona.belongsTo(models.Usuario, { foreignKey: "motoristaId", as: "motorista" });
    Carona.belongsTo(models.Veiculo, { foreignKey: "veiculoId", as: "veiculo" });
    // RELACIONAMENTO 1: uma carona tem várias reservas  -> /caronas/:id/reservas
    Carona.hasMany(models.Reserva, { foreignKey: "caronaId", as: "reservas", onDelete: "CASCADE" });
    // RELACIONAMENTO 2: uma carona tem várias avaliações -> /caronas/:id/avaliacoes
    Carona.hasMany(models.Avaliacao, { foreignKey: "caronaId", as: "avaliacoes", onDelete: "CASCADE" });
  };

  return Carona;
};

export default getCaronaModel;
