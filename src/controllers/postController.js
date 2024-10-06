const app_constants = require("../constants/app.json");
const validationHelper = require("../helpers/validation.js");
const Post = require("../models/postModel.js");
const postServices = require("../services/postServices.js");

exports.uploadPost = async (req, res) => {
  try {
    // console.log("req.file", req.file);

    if (!req.file) {
      return {
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "Please upload the file!",
        result: {},
      }
    }

    const upload_post = await postServices.uploadPost(req);
    return res.json(upload_post);
  } catch (error) {
    return {
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    }
  }
};


exports.DeletePost = async (req, res) => {
  try {
    const delete_post = await postServices.DeletePost(req);
    return res.json(delete_post);
  } catch (error) {
    return {
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    }
  }
};

exports.getPostList = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "id is required",
      });
    }

    const get_posts = await postServices.getPostList(req.query);

    if (!get_posts) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "Please upload the file!",
        result: {},
      });
    }

    return res.json(get_posts);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

exports.getAllPostList = async (req, res) => {
  try {
    const get_all_posts = await postServices.getAllPostList();
    if (!get_all_posts) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "Please upload the file!",
        result: {},
      });
    }
    return res.json(get_all_posts);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "Please upload the file!",
        result: {},
      });
    }

    const required_fields = ["post_id"];
    const validation = validationHelper.validation(required_fields, req.body);
    if (Object.keys(validation).length) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }

    req.body.file = req.file;
    // console.log("req.user: " + req.user);

    const update_post = await postServices.updatePost(req.body, req.user);
    if(update_post){
      fs.unlink(file.path, async (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    return res.json(update_post);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    const required_fields = ["post_id"];

    const validation = validationHelper.validation(required_fields, req.body);
    if (Object.keys(validation).length) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }

    const like_post = await postServices.likePost(req.body, req.user);
    return res.json(like_post);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

exports.getPostLikeList = async (req, res) => {
  try {
    const required_fields = ["post_id"];

    const validation = validationHelper.validation(required_fields, req.query);
    if (Object.keys(validation).length) {
      return res.json({
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: validation,
      });
    }

    const postLikeList = await postServices.getPostLikeList(req.query);
    return res.json(postLikeList);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

exports.downloadPost = async (req, res) => {
  try {
    const post = await postServices.downloadPost(req,res);
    return res.json(post);
  } catch (error) {
    return res.json({
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};




