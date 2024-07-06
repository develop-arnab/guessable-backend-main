const Attempt = require("../services/attempt");
const UserServices = require("../services/user");
const { validationResult } = require("express-validator");

/**
 * Create a new wallet (user) by simply taking address as input
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg || "Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const response = await UserServices.createUser(req.body);
    res.status(201).json({
      user: response.user,
      token: response.token,
      message: "Sign up success",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg || "Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const responseData = await UserServices.signin(req.body);
    res.status(200).json({
      user: responseData.user,
      token: responseData.token,
      message: "Sign in success",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.signInWithOAuth = async (req, res, next) => {
  try {
    const responseData = await UserServices.signinWithOAuth(req.body);
    res.status(200).json({
      user: responseData.user,
      token: responseData.token,
      message: "Sign in success",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.signupWithGameData = async (req, res, next) => {
  try {
    const { signUpType, attemptDataArr, userInfo, streaks } = req.body;
    let signupResponse;
    if (signUpType == "oauth") {
      signupResponse = await UserServices.signinWithOAuth(userInfo);
    } else {
      signupResponse = await UserServices.createUser(userInfo);
    }
    await UserServices.setStreaks({
      countryStreak: streaks.countryStreak,
      movieStreak: streaks.movieStreak,
      userId: signupResponse.user.userId,
    });
    await Attempt.saveAttemptData(attemptDataArr, signupResponse.user.userId);

    res.status(200).json({
      user: signupResponse.user,
      token: signupResponse.token,
      message: "Sign in success",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getStreaks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const streaks = await UserServices.getStreaks(userId);
    res.status(200).json(streaks);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getAllCountries = async (req, res, next) => {
  try {
    const countries = await UserServices.getAllCountries();
    res.status(200).json(countries);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getAllMovies = async (req, res, next) => {
  try {
    const movies = await UserServices.getAllMovies();
    res.status(200).json(movies);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
