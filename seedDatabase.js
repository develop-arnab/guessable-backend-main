const sequelize = require("./databaseConfig/dbconfig");
const User = require("./models/user");
const Question = require("./models/questions");
const CountryQuestion = require("./models/countryQuestions");
const MovieQuestion = require("./models/movieQuestions");
const Attempt = require("./models/attempts");
// const QuestionStatsForUnregisteredUser = require("./models/questionStatsForUnregisteredUsers");

async function seedDatabase() {
  await sequelize.sync({ force: true });

  // Sample data for Users
  const users = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      countryStreak: 5,
      movieStreak: 3,
      timeZone: "+01:00",
      maxStreak: JSON.stringify({ country: 5, movie: 3 })
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "password456",
      countryStreak: 2,
      movieStreak: 4,
      timeZone: "+02:00",
      maxStreak: JSON.stringify({ country: 2, movie: 4 })
    }
  ];

  // Sample data for Questions
  const questions = [
    {
      date: "2024-07-01",
      clueMainBefore: "Main clue before the image",
      clueImage: "image1.jpg",
      clueMainAfter: "Main clue after the image",
      CountryQuestion: {
        countryName: "France",
        clueLatLong: "48.8566, 2.3522",
        clueFlag: "flag_france.png",
        clueCapital: "Paris",
        wikiLink: "https://en.wikipedia.org/wiki/France"
      }
    },
    {
      date: "2024-07-02",
      clueMainBefore: "Main clue before the image",
      clueImage: "image2.jpg",
      clueMainAfter: "Main clue after the image",
      MovieQuestion: {
        movieName: "Inception",
        clueYear: 2010,
        clueDirector: "Christopher Nolan",
        clueCast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
        imdbLink: "https://www.imdb.com/title/tt1375666/"
      }
    }
  ];

  // Sample data for Attempts
  const attempts = [
    {
      attemptValue: 1,
      isCorrect: true,
      quesID: 1
    },
    {
      attemptValue: 2,
      isCorrect: false,
      quesID: 1
    }
  ];

  // Sample data for QuestionStatsForUnregisteredUsers
  const questionStats = [
    {
      attemptsCount: 5,
      correctValues: 3,
      correctAtFirstAttempt: 1,
      correctAtSecondAttempt: 1,
      correctAtThirdAttempt: 1,
      correctAtFourthAttempt: 0
    },
    {
      attemptsCount: 2,
      correctValues: 1,
      correctAtFirstAttempt: 0,
      correctAtSecondAttempt: 1,
      correctAtThirdAttempt: 0,
      correctAtFourthAttempt: 0
    }
  ];

  // Seed the database with sample data
  await User.bulkCreate(users);

  for (const questionData of questions) {
    const {
      CountryQuestion: countryData,
      MovieQuestion: movieData,
      ...question
    } = questionData;
    const createdQuestion = await Question.create(question);

    if (countryData) {
      await CountryQuestion.create({
        ...countryData,
        quesID: createdQuestion.id
      });
    }

    if (movieData) {
      await MovieQuestion.create({ ...movieData, quesID: createdQuestion.id });
    }
  }

  await Attempt.bulkCreate(attempts);
//   await QuestionStatsForUnregisteredUser.bulkCreate(questionStats);

  console.log("Database seeded successfully");
}

seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
});
