const cloudinary = require("../helpers/cloudinary");
const Post = require("../models/postModel");
const app_constants = require("../constants/app.json");
const fs = require("fs");
const { Types } = require("mongoose");
const User = require("../models/userModel");

const axios = require("axios");

exports.uploadPost = async (req) => {
  const { _id } = req.user;

  const caption = req.body.caption ? req.body.caption : "";

  if (!req.file) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "File is not available!",
      result: {},
    };
  }

  const response = await cloudinary.uploader.upload(req.file.path, {
    folder: "allPost_Socail_app",
  });
  


  const result = await Post.create({
    file: {
      public_id: response.public_id,
      url: response.secure_url,
    },
    caption,
    user_id: _id,
  });

  if (result) {
    fs.unlink(req.file.path, async (err) => {
      if (err) console.error("Error deleting file:", err);
    });
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "post uploaded successfully",
      result,
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "internal server error",
    result: {},
  };
};

exports.DeletePost = async (req) => {
  const { id } = req.params;
  const { _id } = req.user;
  // console.log((req.user._id));

  const postData = await Post.findById(id);
  // console.log(postData);

  if (postData.user_id.toString() !== _id.toString()) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "You can't Delete This post",
    };
  }

  if (postData?.file?.public_id) {
    await cloudinary.uploader.destroy(postData?.file?.public_id);
  }

  const result = await Post.deleteOne({ _id: id });

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "post deleted successfully!",
      result,
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "internal server error",
    result: {},
  };
};

exports.getPostList = async (data) => {
  const { id } = data;
  const limit = data.limit ? data.limit : 10000;
  const offset = data.offset ? data.offset : 0;
  const search = data.search ? data.search : "";

  let search_query = {};

  if (search) {
    const rejex = new RegExp(search, "i");
    search_query["$or"] = [{ caption: rejex }];
    // search_query = { caption: rejex };
  }

  const pipeline = [
    { $match: { user_id: new Types.ObjectId(id) } },
    { $match: search_query },
  ];

  const [result, total_count] = await Promise.all([
    Post.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      {
        $project: { __v: 0, user_id: 0 },
      },
      { $skip: +offset },
      { $limit: Number(limit) },
    ]),
    Post.aggregate([...pipeline, { $count: "total_count" }]),
  ]);

  // console.log(total_count);

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "post list fetched succesfully",
      total_count: total_count.length ? total_count[0].total_count : 0,
      result,
    };
  }
  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "Internal Server Error",
    result: {},
  };
};

exports.getAllPostList = async () => {
  const result = await Post.find().sort({ createdAt: -1 });
  // console.log(result);

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "All post list fetched succesfully",
      result,
    };
  }
  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "Internal Server Error",
    result: {},
  };
};

exports.updatePost = async (data, user_data) => {
  // console.log("data", data);
  const { post_id, file } = data;

  const post_data = await Post.findOne({ _id: post_id });
  if (!post_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "Post does not exists!",
      result: {},
    };
  }

  const caption = data.caption ? data.caption : post_data.caption;

  if (post_data.user_id.toString() != user_data._id.toString()) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "You can only update your post",
      result: {},
    };
  }

  const file_url = await cloudinary.uploader.upload(file.path);
  const upload_post = await Post.updateOne(
    { _id: post_id },
    { $set: { file_url: file_url.url, caption } }
  );

  if (upload_post) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "post updated successfully",
      result: upload_post,
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "internal server error",
    result: {},
  };
};

exports.likePost = async (data, user_data) => {
  // console.log("data", data);
  const { _id } = user_data;
  const { post_id } = data;

  const post_data = await Post.findOne({ _id: post_id });
  if (!post_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "Post does not exists!",
      result: {},
    };
  }

  const like_check = post_data.likes.includes(_id);

  if (like_check) {
    // If already liked, unlike the post

    const filterData = post_data.likes.filter(
      (id) => id.toString() != _id.toString()
    );
    // console.log("baad",filterData);
    const update_post = await Post.updateOne(
      { _id: post_id },
      { $set: { likes: filterData } }
    );
    if (update_post) {
      return {
        success: 0,
        status: app_constants.BAD_REQUEST,
        message: "Post was liked now it is unlike",
        result: {},
      };
    }
  }

  post_data.likes.push(_id);



  const update_post = await Post.updateOne(
    { _id: post_id },
    { $set: { likes: post_data.likes } }
  );




  if (update_post) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "post Liked successfully",
      result: {},
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "internal server error",
    result: {},
  };
};

exports.getPostLikeList = async (data) => {
  const { post_id } = data;
  // console.log("post_id: " + post_id);

  const limit = data.limit ? data.limit : 10000;
  const offset = data.offset ? data.offset : 0;
  const search = data.search ? data.search : "";

  const mongo_id = new Types.ObjectId(post_id);

  const post_data = await Post.findOne({ _id: post_id });
  if (!post_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "Post does not exists!",
      result: {},
    };
  }

  let search_query = {};
  if (search) {
    const regex = new RegExp(search, "i");
    search_query["$or"] = [
      { "likes_details.username": regex },
      { "likes_details.email": regex },
    ];
  }

  const pipeline = [
    { $match: { _id: mongo_id } },
    {
      $lookup: {
        from: "users",
        localField: "likes",
        foreignField: "_id",
        as: "likes_details",
      },
    },
    { $unwind: "$likes_details" },
    { $match: search_query },
  ];

  const [result, total_count] = await Promise.all([
    Post.aggregate([
      ...pipeline,
      {
        $project: {
          _id: 0,
          username: "$likes_details.username",
          email: "$likes_details.email",
          user_id: "$likes_details._id",
        },
      },
      { $skip: +offset },
      { $limit: Number(limit) },
    ]),
    Post.aggregate([...pipeline, { $count: "total_count" }]),
  ]);

  // console.log(total_count);

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "Post like list fetched successfully!",
      total_count: total_count.length ? total_count[0].total_count : 0,
      result,
    };
  }

  return {
    success: 0,
    status: app_constants.INTERNAL_SERVER_ERROR,
    message: "Internal server error!",
    result: {},
  };
};

exports.downloadPost = async (req, res) => {
  const { postid } = req.params;

  const post_data = await Post.findById(postid);

  if (!post_data) {
    return res.status(400).json({
      success: 0,
      message: "Post does not exist!",
    });
  }

  const downloadUrl = post_data.file.url.replace(
    "/upload/",
    "/upload/fl_attachment/"
  );

  return res.redirect(downloadUrl);
};
