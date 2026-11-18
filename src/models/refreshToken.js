// ATIVIDADE 9 (Sessão persistente) — REFRESH TOKEN
// O token de acesso (JWT) vale só 15 minutos. Para não pedir login de novo
// a cada 15 minutos, o usuário recebe também um refresh token, que vale 7 dias
// e fica registrado aqui. Ele é trocado por um novo a cada uso (rotação).
const getRefreshTokenModel = (sequelize, { DataTypes }) => {
  const RefreshToken = sequelize.define(
    "refreshToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Guardamos o HASH do token (como numa senha): se o banco vazar, os tokens não servem
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { tableName: "refresh_tokens" },
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.Usuario, { foreignKey: "usuarioId", as: "usuario" });
  };

  return RefreshToken;
};

export default getRefreshTokenModel;
