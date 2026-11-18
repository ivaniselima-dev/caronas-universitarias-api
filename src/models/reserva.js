// RESERVA: um passageiro garantindo lugar em uma carona.
const getReservaModel = (sequelize, { DataTypes }) => {
  const Reserva = sequelize.define(
    "reserva",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lugares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
      },
      status: {
        type: DataTypes.ENUM("pendente", "confirmada", "cancelada"),
        allowNull: false,
        defaultValue: "pendente",
      },
    },
    { tableName: "reservas" },
  );

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Carona, { foreignKey: "caronaId", as: "carona" });
    // passageiroId = DONO da reserva
    Reserva.belongsTo(models.Usuario, { foreignKey: "passageiroId", as: "passageiro" });
  };

  return Reserva;
};

export default getReservaModel;
