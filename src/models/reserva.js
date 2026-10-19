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
      // Quantos lugares o passageiro quer reservar
      lugares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: { args: [1], msg: "lugares deve ser no mínimo 1" } },
      },
      // Situação da reserva
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendente",
        validate: {
          isIn: {
            args: [["pendente", "confirmada", "cancelada"]],
            msg: "status deve ser pendente, confirmada ou cancelada",
          },
        },
      },
    },
    { tableName: "reservas" },
  );

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Carona, { foreignKey: "caronaId", as: "carona" });
    // passageiroId: quem fez a reserva
    Reserva.belongsTo(models.Usuario, { foreignKey: "passageiroId", as: "passageiro" });
  };

  return Reserva;
};

export default getReservaModel;
