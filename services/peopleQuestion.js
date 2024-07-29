const Question = require("./question");
const PeopleQuestionModel = require("../models/peopleQuestions");
const { QuestionsConstants } = require("../utils/constants");
class PeopleQuestion extends Question {
  constructor() {
    super(PeopleQuestionModel);
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
      return undefined
    }

    const response = {
      id: question.id,
      date: question.date,
      clueMainBefore: question.clueMainBefore,
      clueMainAfter: question.clueMainAfter,
      wikiLink: question["PeopleQuestion.wikiLink"],
      clueImage: question.clueImage
    };

    return response;
  } catch(e){
    return undefined
  }
  }

  createQuestionResponse(question) {
    let response = {};
    if (!question) {
      let error = new Error("Could not fetch question please try again!");
      error.statusCode = 404;
      throw error;
    }
    // Construct response object
    let attempt = question.attemptInfo;
    let attemptInfo = {
      id: attempt.id,
      attemptValue: attempt.attemptValue
    };
    attemptInfo.maxAttempts = QuestionsConstants.maxAttempts;
    attemptInfo.isCorrect = attempt.isCorrect;

    let attemptValue = attempt.attemptValue;
    attemptInfo.maxAttempts = QuestionsConstants.maxAttempts;
    if (attemptValue >= 1) {
      attemptInfo.clueOne = {
        Year: question["PeopleQuestion.personName"]
      };
    }

    if (attemptValue >= 2) {
      attemptInfo.clueTwo = {
        Director: question["PeopleQuestion.clueNationality"]
      };
    }

    if (attemptValue >= 3) {
      attemptInfo.clueThree = {
        Cast: question["PeopleQuestion.clueLifespan"]
      };
    }
    if (attemptInfo.isCorrect || attemptValue == 4) {
      response.answer = question["PeopleQuestion.clueInitials"];
      response.clueMainAfter = question.clueMainAfter;
      attemptInfo.clueOne = {
        Year: question["PeopleQuestion.personName"]
      };
      attemptInfo.clueTwo = {
        Director: question["PeopleQuestion.clueNationality"]
      };
      attemptInfo.clueThree = {
        Cast: question["PeopleQuestion.clueLifespan"]
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
      wikiLink: question["PeopleQuestion.wikiLink"],
      clueImage: question.clueImage,
      attemptsInfo: attemptInfo
    };
    return response;
  }
}

module.exports = PeopleQuestion;
