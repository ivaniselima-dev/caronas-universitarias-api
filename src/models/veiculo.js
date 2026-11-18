// VEÍCULO: o carro que o motorista usa nas caronas.
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
      },
      // Quantos passageiros cabem (sem contar o motorista)
      lugares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 8 },
      },
    },
    { tableName: "veiculos" },
  );

  Veiculo.associate = (models) => {
    // usuarioId = DONO do veículo. Só ele (ou um ADMIN) pode alterar ou apagar.
    Veiculo.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "dono" });
    Veiculo.hasMany(models.Carona, { foreignKey: "veiculoId", as: "caronas", onDelete: "CASCADE" });
  };

  return Veiculo;
};

export default getVeiculoModel;
