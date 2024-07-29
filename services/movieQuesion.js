const Question = require("./question");
const MovieQuestionModel = require("../models/movieQuestions");
const { QuestionsConstants } = require("../utils/constants");
class MovieQuestion extends Question {
  constructor() {
    super(MovieQuestionModel);
  }

  async getQuestion(date, userId) {
    try {
      let question = await super.getQuestion(date, userId);
      return this.createQuestionResponse(question);
    } catch (e) {
      return undefined;
    }
  }

  async getQuestionByDate(date, userId, isRegistered) {
    let question = await super.getQuestionByDate(date, userId, isRegistered);
    return this.createQuestionResponse(question);
  }

  async getQuestionForUnregisteredUser(date) {
    console.log("movie question get question for unregistered user");
    try{
    let question = await super.getQuestionForUnregisteredUser(date);
    if (!question) {
      let error = new Error("Could not fetch question please try again!");
      // error.statusCode = 404;
      // throw error;
      return undefined;
    }

    const response = {
      id: question.id,
      date: question.date,
      clueMainBefore: question.clueMainBefore,
      clueMainAfter: question.clueMainAfter,
      imdbLink: question["MovieQuestions.imdbLink"],
      clueImage: question.clueImage,
    };

    return response;
  } catch(e){
    return undefined
  }
  }

  createQuestionResponse(question) {
    let response = {  };
    if (!question) {
      let error = new Error("Could not fetch question please try again!");
      error.statusCode = 404;
      throw error;
    }
    // Construct response object
    let attempt = question.attemptInfo;
    let attemptInfo = {
      id: attempt.id,
      attemptValue: attempt.attemptValue,
    };
    attemptInfo.maxAttempts = QuestionsConstants.maxAttempts;
    attemptInfo.isCorrect = attempt.isCorrect;

    let attemptValue = attempt.attemptValue;
    attemptInfo.maxAttempts = QuestionsConstants.maxAttempts;
    if (attemptValue >= 1) {
      attemptInfo.clueOne = {
        Year: question["MovieQuestion.clueYear"],
      };
    }

    if (attemptValue >= 2) {
      attemptInfo.clueTwo = {
        Director: question["MovieQuestion.clueDirector"],
      };
    }

    if (attemptValue >= 3) {
      attemptInfo.clueThree = {
        Cast: question["MovieQuestion.clueCast"],
      };
    }
    if (attemptInfo.isCorrect || attemptValue == 4) {
      response.answer = question["MovieQuestion.movieName"];
      response.clueMainAfter = question.clueMainAfter;
      attemptInfo.clueOne = {
        Year: question["MovieQuestion.clueYear"]
      };
      attemptInfo.clueTwo = {
        Director: question["MovieQuestion.clueDirector"]
      };
      attemptInfo.clueThree = {
        Cast: question["MovieQuestion.clueCast"]
      };
      response.allResponses = [
        attempt.firstAttempt,
        attempt.secondAttempt,
        attempt.thirdAttempt,
        attempt.fourthAttempt
      ]; 
    }

    response = {
      ...response,
      id: question.id,
      date: question.date,
      clueMainBefore: question.clueMainBefore,
      imdbLink: question["MovieQuestion.imdbLink"],
      clueImage: question.clueImage,
      attemptsInfo: attemptInfo,
    };
    return response;
  }
}

module.exports = MovieQuestion;
