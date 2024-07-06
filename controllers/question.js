const Attempt = require("../services/attempt");
const Question = require("../services/question");
const Utils = require("../utils/utils");

exports.getQuestion = async (req, res, next) => {
  try {
    console.log("Requested to /question with params: " + req.params);
    const userId = req.user.id;
    const date = Utils.getCurrentDate();
    const questionType = req.params.questionType;
    const question = Utils.getInstance(questionType);
    const fetchedQues = await question.getQuestion(date, userId);
    res.status(200).json(fetchedQues);
    console.log(fetchedQues);
  } catch (err) {
    next(err);
  }
};

exports.makeAttempt = async (req, res, next) => {
  console.log("Requested to /makeAttempt with body: " + req.body);
  try {
    const { attemptDataId, chooseValue, questionType } = req.body;

    const response = await Attempt.makeAttempt({
      attemptDataId,
      chooseValue,
      questionType,
      isRegistered: true,
    });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.makeAttemptForUnregisteredUser = async (req, res, next) => {
  console.log(
    "Requested to /makeAttemptForUnregisteredUser with body: " + req.body
  );
  try {
    const { attemptData, chooseValue, questionType } = req.body;

    const response = await Attempt.makeAttempt({
      chooseValue,
      questionType,
      isRegistered: false,
      attemptData,
    });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getQuestionStats = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const stats1 = await Question.getQuestionStats(questionId);
    const stats2 = await Question.getQuestionStatsForUnregisteredAttempts(questionId);
    console.log(stats1,stats2)
    const response =  Question.combineResponses(stats1,stats2);
    res.status(200).json({
      response,
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuestionByDate = async (req, res, next) => {
  try {
    const { date, questionType } = req.params;
    const isRegistered = req.query.registered === "true";
    const userId = req.query.userId;
    const questionIns = Utils.getInstance(questionType);
    console.log(date, userId, isRegistered);
    const response = await questionIns.getQuestionByDate(
      date,
      userId,
      isRegistered
    );
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.getQuestionForUnregisteredUser = async (req, res, next) => {
  try {
    const { questionType } = req.params;
    const date = Utils.getCurrentDate();
    const questionIns = Utils.getInstance(questionType);
    console.log("questionIns ", questionIns);
    const response = await questionIns.getQuestionForUnregisteredUser(date);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.makeAttemptForOldQuestion = async (req, res, next) => {
  console.log("Requested to /makeAttemptForOldQuestion with body: " + req.body);
  try {
    const { attemptData, chooseValue, questionType } = req.body;

    const response = await Attempt.makeAttempt({
      chooseValue,
      questionType,
      isRegistered: false,
      attemptData,
    });
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getQuestionTypeStatsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const type = req.params.questionType;
    const question = Utils.getInstance(type);
    const questionTypeStats = await question.questionTypeStats(userId);
    res.status(200).json(questionTypeStats);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
