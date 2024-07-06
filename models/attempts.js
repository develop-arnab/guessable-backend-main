const { DataTypes } = require("sequelize");
const sequelize = require("../databaseConfig/dbconfig");

const Attempt = sequelize.define(
  "Attempt",
  {
    attemptValue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    quesID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Questions",
        key: "id"
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = Attempt;
