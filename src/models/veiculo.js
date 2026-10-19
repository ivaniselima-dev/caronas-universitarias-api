// VEÍCULO: o carro que o motorista usa nas caronas. Pertence a um usuário.
const getVeiculoModel = (sequelize, { DataTypes }) => {
  const Veiculo = sequelize.define(
    "veiculo",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      modelo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "modelo é obrigatório" } },
      },
      cor: {
        type: DataTypes.STRING,
      },
      placa: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: "placa é obrigatória" } },
      },
      // Quantos passageiros cabem (sem contar o motorista)
      lugares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: "lugares deve ser no mínimo 1" },
          max: { args: [8], msg: "lugares deve ser no máximo 8" },
        },
      },
    },
    { tableName: "veiculos" },
  );

  Veiculo.associate = (models) => {
    // usuarioId: o DONO do veículo. Só ele pode alterar ou apagar.
    Veiculo.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "dono" });
    // Um veículo pode ser usado em várias caronas
    Veiculo.hasMany(models.Carona, { foreignKey: "veiculoId", as: "caronas", onDelete: "CASCADE" });
  };

  return Veiculo;
};

export default getVeiculoModel;
