const sequelize = require("./databaseConfig/dbconfig");
const User = require("./models/user");
const Question = require("./models/questions");
const CountryQuestion = require("./models/countryQuestions");
const MovieQuestion = require("./models/movieQuestions");
const CurrentDate = require('./models/currentDate')
const Attempt = require("./models/attempts");

async function seedDatabase() {
  // Sync models in order of dependencies
  await sequelize.sync({ force: true });

  // Sample data for Questions, CountryQuestions, and MovieQuestions
  const questions = [
    {
      date: "2024-07-16",
      clueMainBefore: "Identify this country!",
      clueImage: "france_image.jpg",
      clueMainAfter: "You guessed France!",
      category: "country",
      answer: "France",
      CountryQuestion: {
        countryName: "France",
        clueLatLong: { lat: "48.8566", long: "2.3522" },
        clueFlag: "flag_france.png",
        clueCapital: "Paris",
        wikiLink: "https://en.wikipedia.org/wiki/France"
      }
    },
    {
      date: "2024-07-17",
      clueMainBefore: "Identify this country!",
      clueImage: "germany_image.jpg",
      clueMainAfter: "You guessed Germany!",
      category: "country",
      answer: "Germany",
      CountryQuestion: {
        countryName: "Germany",
        clueLatLong: { lat: "52.5200", long: "13.4050" },
        clueFlag: "flag_germany.png",
        clueCapital: "Berlin",
        wikiLink: "https://en.wikipedia.org/wiki/Germany"
      }
    },
    {
      date: "2024-07-18",
      clueMainBefore: "Identify this country!",
      clueImage: "japan_image.jpg",
      clueMainAfter: "You guessed Japan!",
      category: "country",
      answer: "Japan",
      CountryQuestion: {
        countryName: "Japan",
        clueLatLong: { lat: "35.6895", long: "139.6917" },
        clueFlag: "flag_japan.png",
        clueCapital: "Tokyo",
        wikiLink: "https://en.wikipedia.org/wiki/Japan"
      }
    },
    {
      date: "2024-07-19",
      clueMainBefore: "Identify this country!",
      clueImage: "australia_image.jpg",
      clueMainAfter: "You guessed Australia!",
      category: "country",
      answer: "Australia",
      CountryQuestion: {
        countryName: "Australia",
        clueLatLong: { lat: "-35.2809", long: "149.1300" },
        clueFlag: "flag_australia.png",
        clueCapital: "Canberra",
        wikiLink: "https://en.wikipedia.org/wiki/Australia"
      }
    },
    {
      date: "2024-07-20",
      clueMainBefore: "Identify this country!",
      clueImage: "brazil_image.jpg",
      clueMainAfter: "You guessed Brazil!",
      category: "country",
      answer: "Brazil",
      CountryQuestion: {
        countryName: "Brazil",
        clueLatLong: { lat: "-15.8267", long: "-47.9218" },
        clueFlag: "flag_brazil.png",
        clueCapital: "Brasília",
        wikiLink: "https://en.wikipedia.org/wiki/Brazil"
      }
    },
    {
      date: "2024-07-16",
      clueMainBefore: "Identify this movie!",
      clueImage: "inception_image.jpg",
      clueMainAfter: "You guessed Inception!",
      category: "movie",
      answer: "Inception",
      MovieQuestion: {
        movieName: "Inception",
        clueYear: 2010,
        clueDirector: "Christopher Nolan",
        clueCast: "Leonardo DiCaprio,Joseph Gordon-Levitt,Ellen Page",
        imdbLink: "https://www.imdb.com/title/tt1375666/"
      }
    },
    {
      date: "2024-07-17",
      clueMainBefore: "Identify this movie!",
      clueImage: "matrix_image.jpg",
      clueMainAfter: "You guessed The Matrix!",
      category: "movie",
      answer: "The Matrix",
      MovieQuestion: {
        movieName: "The Matrix",
        clueYear: 1999,
        clueDirector: "Lana Wachowski, Lilly Wachowski",
        clueCast: "Keanu Reeves,Laurence Fishburne,Carrie-Anne Moss",
        imdbLink: "https://www.imdb.com/title/tt0133093/"
      }
    },
    {
      date: "2024-07-18",
      clueMainBefore: "Identify this movie!",
      clueImage: "godfather_image.jpg",
      clueMainAfter: "You guessed The Godfather!",
      category: "movie",
      answer: "The Godfather",
      MovieQuestion: {
        movieName: "The Godfather",
        clueYear: 1972,
        clueDirector: "Francis Ford Coppola",
        clueCast: "Marlon Brando, Al Pacino, James Caan",
        imdbLink: "https://www.imdb.com/title/tt0068646/"
      }
    },
    {
      date: "2024-07-19",
      clueMainBefore: "Identify this movie!",
      clueImage: "lotr_image.jpg",
      clueMainAfter:
        "You guessed The Lord of the Rings: The Fellowship of the Ring!",
      category: "movie",
      answer: "The Lord of the Rings: The Fellowship of the Ring",
      MovieQuestion: {
        movieName: "The Lord of the Rings: The Fellowship of the Ring",
        clueYear: 2001,
        clueDirector: "Peter Jackson",
        clueCast: "Elijah Wood,Ian McKellen,Orlando Bloom",
        imdbLink: "https://www.imdb.com/title/tt0120737/"
      }
    },
    {
      date: "2024-07-20",
      clueMainBefore: "Identify this movie!",
      clueImage: "shawshank_image.jpg",
      clueMainAfter: "You guessed The Shawshank Redemption!",
      category: "movie",
      answer: "The Shawshank Redemption",
      MovieQuestion: {
        movieName: "The Shawshank Redemption",
        clueYear: 1994,
        clueDirector: "Frank Darabont",
        clueCast: "Tim Robbins,Morgan Freeman,Bob Gunton",
        imdbLink: "https://www.imdb.com/title/tt0111161/"
      }
    }
  ];

  // const temp_date = [{
  //   temp_date: "2024-07-07"
  // }]
 await CurrentDate.create({
   temp_date: "2024-07-07"
 });
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
        clueLatLong: JSON.stringify(countryData.clueLatLong),
        quesID: createdQuestion.id
      });
    }

    if (movieData) {
      await MovieQuestion.create({
        ...movieData,
        clueCast: JSON.stringify(movieData.clueCast),
        quesID: createdQuestion.id
      });
    }
  }

  console.log("Database seeded successfully");
}

seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
});
