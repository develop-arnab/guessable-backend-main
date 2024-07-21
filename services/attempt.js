const AttemptModel = require("../models/attempts");
const CountryQuestion = require("../models/countryQuestions");
const MovieQuestion = require("../models/movieQuestions");
const QuestionModel = require("../models/questions");
const User = require("../models/user");
const QuestionStats = require("../models/questionStats");

const { QuestionsConstants } = require("../utils/constants");
const Utils = require("../utils/utils");
const UserServices = require("./user");

class Attempt {
  static async makeAttempt({
    attemptDataId,
    chooseValue,
    questionType,
    attemptData,
    isRegistered,
  }) {
    let attempt;
    if (isRegistered) {
      attempt = await AttemptModel.findOne({
        include: [
          {
            model: QuestionModel,
            required: true,
          },
        ],
        where: {
          id: attemptDataId,
        },
        raw: true,
      });

      if (!attempt) {
        const error = new Error(
          "Bad argument: Could not find the attempt data for id: " +
            attemptDataId
        );
        error.statusCode = 404;
        throw error;
      }
      let restructuredAttempt = {
        id: attempt.id,
        attemptValue: attempt.attemptValue,
        isCorrect: attempt.isCorrect,
        quesID: attempt.quesID,
        userID: attempt.userID,
        question: {
          id: attempt["Question.id"],
          date: attempt["Question.date"],
          clueMainBefore: attempt["Question.clueMainBefore"],
          clueImage: attempt["Question.clueImage"],
          clueMainAfter: attempt["Question.clueMainAfter"],
        },
        firstAttempt : attempt.firstAttempt,
        secondAttempt : attempt.secondAttempt,
        thirdAttempt : attempt.thirdAttempt,
        fourthAttempt : attempt.fourthAttempt
      };
      attempt = restructuredAttempt;
    } else {
      attempt = attemptData;
      const questionForGivenAttempt = await QuestionModel.findOne({
        where: {
          id: attempt.quesID,
        },
        raw: true,
      });
      attempt.question = questionForGivenAttempt;
    }

    if (attempt.isCorrect) {
      const error = new Error(
        "This question has already been answered correctly"
      );
      error.statusCode = 409;
      throw error;
    }

    if (attempt.attemptValue >= QuestionsConstants.maxAttempts) {
      const error = new Error("Attempts limit reached");
      error.statusCode = 429;
      throw error;
    }
    const subQuestionType = Utils.getInstance(questionType);
    const questionData = await subQuestionType.getQuestionById(
      attempt.question.id
    );
    if (!questionData) {
      const error = new Error(
        `Question not found, please verify the payload is correct: { attemptDataId: ${attemptDataId}, chooseValue: ${chooseValue}, questionType: ${questionType}}`
      );
      error.statusCode = 404;
      throw error;
    }
    questionData.clueMainAfter = attempt.question.clueMainAfter
    let truthValue;
    var response = {};
    let updatedAttempt = attempt;
    if (questionType === QuestionsConstants.COUNTRY) {
      truthValue = questionData.countryName;
    } else if (questionType === QuestionsConstants.MOVIE) {
      truthValue = questionData.movieName;
    }

    if (truthValue !== chooseValue.trim()) {
      response.isCorrect = false;
      if(attempt.attemptValue){
      attempt.attemptValue = parseInt(attempt.attemptValue);
      } else {
        attempt.attemptValue = 0
      }
      if (attempt.attemptValue == QuestionsConstants.maxAttempts - 1) {
        console.info("Final attempt failed too");
        updatedAttempt.attemptValue = 4;
        response.answer =
          questionType === QuestionsConstants.COUNTRY
            ? questionData.countryName
            : questionData.movieName;
        updatedAttempt.fourthAttempt = chooseValue;
        response.clueMainAfter = questionData.clueMainAfter;
        if (isRegistered) {
          console.info("user is registered and we are updating streak");
          const obj =
            questionType === QuestionsConstants.COUNTRY
              ? { countryStreak: 0 }
              : { movieStreak: 0 };

          obj.userId = attempt.userID;

          await UserServices.setStreaks(obj);
        }
      } else if (attempt.attemptValue == 0) {
        updatedAttempt.attemptValue = 1;
        response.clueOne =
          questionType === QuestionsConstants.COUNTRY
            ? { LatLong: questionData.clueLatLong }
            : { releaseYear: questionData.clueYear };
        updatedAttempt.firstAttempt = chooseValue
      } else if (attempt.attemptValue == 1) {
        updatedAttempt.attemptValue = 2;
        response.clueTwo =
          questionType === QuestionsConstants.COUNTRY
            ? { flag: questionData.clueFlag }
            : { cast: questionData.clueCast };
        updatedAttempt.secondAttempt = chooseValue;
      } else if (attempt.attemptValue == 2) {
        updatedAttempt.attemptValue = 3;
        response.clueThree =
          questionType === QuestionsConstants.COUNTRY
            ? { capital: questionData.clueCapital }
            : { director: questionData.clueDirector };
        updatedAttempt.thirdAttempt = chooseValue
      }
      if (isRegistered) {
        await AttemptModel.update(
          {
            attemptValue: updatedAttempt.attemptValue,
            firstAttempt: updatedAttempt?.firstAttempt || null,
            secondAttempt: updatedAttempt?.secondAttempt || null,
            thirdAttempt : updatedAttempt?.thirdAttempt || null,
            fourthAttempt : updatedAttempt?.fourthAttempt || null,
          },
          {
            where: { id: attemptDataId }
          }
        );
      } else {
        const [record, created] = await QuestionStats.findOrCreate({
          where: { quesID: questionData.quesID },
          defaults: { quesID: questionData.quesID },
        });
        console.log(record,created)
        console.log(updatedAttempt.attemptValue)
        if (updatedAttempt.attemptValue == 1)
          await record.increment("attemptsCount", { by: 1 });
      }
    } else if (isRegistered && truthValue == chooseValue.trim()) {
      console.info(
        "Answer is correct and user is registered, now updating streak and stats"
      );
      await UserServices.updateStreak(true, attempt.userID, questionType);
      updatedAttempt.attemptValue++;
      if (attempt.attemptValue) {
        attempt.attemptValue = parseInt(attempt.attemptValue);
      } else {
        attempt.attemptValue = 0;
      }

      if (attempt.attemptValue == 4) {
        updatedAttempt.fourthAttempt = chooseValue;
      } else if (attempt.attemptValue == 1) {
        updatedAttempt.firstAttempt = chooseValue;
      } else if (attempt.attemptValue == 2) {
        updatedAttempt.secondAttempt = chooseValue;
      } else if (attempt.attemptValue == 3) {
        updatedAttempt.thirdAttempt = chooseValue;
      }
      await AttemptModel.update(
        {
          attemptValue: updatedAttempt.attemptValue,
          isCorrect: true,
          firstAttempt: updatedAttempt?.firstAttempt || null,
          secondAttempt: updatedAttempt?.secondAttempt || null,
          thirdAttempt: updatedAttempt?.thirdAttempt || null,
          fourthAttempt: updatedAttempt?.fourthAttempt || null
        },
        {
          where: { id: attemptDataId }
        }
      );
      await UserServices.scheduleJob(attempt.userID, questionType);
      response = await this.postCorrectAnswer(
        questionType,
        questionData,
        attempt.attemptValue
      );

      return response;
    } else {
      updatedAttempt.attemptValue =  updatedAttempt.attemptValue +1;
      const [record, created] = await QuestionStats.findOrCreate({  
        where: { quesID: questionData.quesID },
        defaults: { quesID: questionData.quesID },
      });
      // Increment the correct values count if the attempt is correct
      await record.increment("correctValues", { by: 1 });
      if (updatedAttempt.attemptValue=== 1) {
        await record.increment("attemptsCount", { by: 1 });
        await record.increment("correctAtFirstAttempt", { by: 1 });
      } else if (updatedAttempt.attemptValue === 2) {
        await record.increment("correctAtSecondAttempt", { by: 1 });
      } else if (updatedAttempt.attemptValue === 3) {
        await record.increment("correctAtThirdAttempt", { by: 1 });
      } else if (updatedAttempt.attemptValue === 4) {
        await record.increment("correctAtFourthAttempt", { by: 1 });
      }
      console.log(attempt)
      response = await this.postCorrectAnswer(
        questionType,
        questionData,
        attempt.attemptValue
      );
      response.clueMainAfter = questionData.clueMainAfter;

      console.info(response);
      return response;
    }

    return response;
  }

  static async postCorrectAnswer(questionType, questionData, attemptValue) {
    var response = {};
    attemptValue = parseInt(attemptValue) + 1;
    const isCorrect = true;

    response.isCorrect = true;
    response.clueMainAfter = questionData.clueMainAfter;
    response.answer =
      questionType === QuestionsConstants.COUNTRY
        ? questionData.countryName
        : questionData.movieName;
    response.clueOne =
      questionType === QuestionsConstants.COUNTRY
        ? { LatLong: questionData.clueLatLong }
        : { releaseYear: questionData.clueYear };
    response.clueTwo =
      questionType === QuestionsConstants.COUNTRY
        ? { flag: questionData.clueFlag }
        : { cast: questionData.clueCast };

    response.clueThree =
      questionType === QuestionsConstants.COUNTRY
        ? { capital: questionData.clueCapital }
        : { director: questionData.clueDirector };
    response.clueMainAfter = questionData.clueMainAfter;


    return response;
  }

  static async hasAnswered(userId) {
    const date = Utils.getCurrentDate();
    const countryQuestionModel = Utils.getInstance(QuestionsConstants.COUNTRY);
    const movieQuestionModel = Utils.getInstance(QuestionsConstants.MOVIE);

    const countryQuestion = await QuestionModel.findOne({
      where: {
        date: date,
      },
      include: [
        {
          model: CountryQuestion,
          require: true,
        },
      ],
      raw: true,
    });

    const movieQuestion = await QuestionModel.findOne({
      where: {
        date: date,
      },
      include: [
        {
          model: MovieQuestion,
          require: true,
        },
      ],
      raw: true,
    });

    if (!countryQuestion || !movieQuestion) {
      const error = new Error(`Question not found for todays date: ${date}`);
      error.statusCode = 404;
      throw error;
    }

    const countryAttempt = await AttemptModel.findOne({
      where: {
        quesID: countryQuestion.id,
        userID: userId,
      },
      raw: true,
    });

    const movieAttempt = await AttemptModel.findOne({
      where: {
        quesID: movieQuestion.id,
        userID: userId,
      },
      raw: true,
    });

    if (!countryAttempt || !movieAttempt) {
      const error = new Error(
        `Attempt not found for question with date: ${date} and user Id ${userId} thus not updating`
      );
      error.statusCode = 404;
      throw error;
    }

    return {
      isCountryQuestionAttempted: countryAttempt.isCorrect,
      isMovieQuestionAttempted: movieAttempt.isCorrect,
    };
  }

  static async saveAttemptData(attemptDataArr, userId) {
      const attempts = attemptDataArr.map((attempt) => ({
        attemptValue: attempt.attemptValue,
        isCorrect: attempt.isCorrect,
        quesID: attempt.quesID,
        userID: userId,
        firstAttempt: attempt.firstAttempt,
        secondAttempt: attempt.secondAttempt,
        thirdAttempt: attempt.thirdAttempt,
        fourthAttempt: attempt.fourthAttempt
      }));

      await AttemptModel.bulkCreate(attempts);
  }
}

module.exports = Attempt;
