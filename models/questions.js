const { DataTypes } = require("sequelize");
const sequelize = require("../databaseConfig/dbconfig");
const CountryQuestion = require("./countryQuestions");
const MovieQuestion = require("./movieQuestions");
const Attempt = require("./attempts");

const Question = sequelize.define(
  "Question",
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    clueMainBefore: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clueImage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clueMainAfter: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);

Question.hasOne(CountryQuestion, { foreignKey: "quesID" });
Question.hasOne(MovieQuestion, { foreignKey: "quesID" });
Question.hasMany(Attempt, { foreignKey: "quesID" });

module.exports = Question;
