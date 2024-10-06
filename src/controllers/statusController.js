const app_constants = require("../constants/app.json");
const statusServices = require("../services/statusServices.js");

exports.addStatus = async (req, res) => {
  try {
    const add_status = await statusServices.addStatus(req);
    return res.json(add_status);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};

exports.getStatusList = async (req, res) => {
  try {
    const list_status = await statusServices.getStatusList(req);
    return res.json(list_status);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    const delete_status = await statusServices.deleteStatus(req);
    return res.json(delete_status);
  } catch (err) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};