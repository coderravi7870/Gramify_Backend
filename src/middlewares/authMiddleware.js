// const jwtToken = "fjsdlkfjsld";
const app_constants = require("../constants/app.json");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  // console.log("ram ram");
  
  const { social_token } = req.cookies;
  
    // console.log(social_token);

  if (!social_token) {
    return res.json({
      success: 0,
      status: app_constants.UNAUTHORIZED,
      message: "Please pass the token",
      result: {},
    });
  }

  //   console.log(token);
  // console.log("token: " + token);

  try {
    const decoded = jwt.decode(social_token);

    const user_data = await User.findById(decoded.id);

    if (!user_data) {
      return res.json({
        success: 0,
        status: app_constants.UNAUTHORIZED,
        message: "user does not exist",
        result: {},
      });
    }
    req.user = user_data;
    next();
  } catch (error) {
    return res.status(401).json({
      success: 0,
      status: app_constants.UNAUTHORIZED,
      message: "Token is invalid or expired",
      result: {},
    });
  }
};
