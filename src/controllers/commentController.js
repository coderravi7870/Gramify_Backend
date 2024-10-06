const app_constants = require("../constants/app.json");
const validationHelper = require("../helpers/validation");
const commentServices = require("../services/commentServices");

exports.addComment = async (req, res) => {
  try {
    const required_fields = ["post_id", "text"];
    const validation = validationHelper.validation(required_fields, req.body);
    if (Object.keys(validation).length) {
      return res.json({
        uydsfg: "segfi",
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }
    // console.log(req.body);

    const add_comment = await commentServices.addComment(req.body, req.user);
    // console.log(add_comment);

    return res.json(add_comment);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};


exports.getCommentList = async (req, res) => {
  try {
    const required_fields = ["post_id"];
    const validation = validationHelper.validation(required_fields, req.query);
    if (Object.keys(validation).length) {
      return res.json({
        uydsfg: "segfi",
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }
    // console.log(req.body);

    const List_comment = await commentServices.getCommentList(req.query);
    // console.log(List_comment);

    return res.json(List_comment);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};


exports.updateComment = async (req, res) => {
  try {
    const required_fields = ["_id"];
    const validation = validationHelper.validation(required_fields, req.body);
    if (Object.keys(validation).length) {
      return res.json({
        uydsfg: "segfi",
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }
    // console.log(req.body);

    const updatedcomment = await commentServices.updateComment(req.body);
    // console.log(updatedcomment);

    return res.json(updatedcomment);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};

exports.getTotalMainCount = async (req, res) => {
  try {
    const total_mainCount = await commentServices.getTotalMainCount();
    // console.log(updatedcomment);

    return res.json(total_mainCount);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};
