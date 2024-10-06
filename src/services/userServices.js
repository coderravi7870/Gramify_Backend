const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const app_constants = require("../constants/app.json");
const { Types } = require("mongoose");
const sendEmail = require("../helpers/sendEmail");
const sendToken = require("../helpers/sentToken");
const cloudinary = require("../helpers/cloudinary");
const fs = require("fs");

exports.userSignUp = async (data) => {
  const user_data = await User.findOne({ email: data.email });
  if (user_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "Email already exists",
      result: {},
    };
  }
  const salt = await bcrypt.genSalt(10);
  const hash_password = await bcrypt.hash(data.password, salt);

  const add_user = await User.create({ ...data, password: hash_password });
  //to send email

  const subject = "Welcome to Our APP!";
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  </head>
  <body> <h2>Hi ${data.username}</h2> <p>Welcome to our application</p> <p>Thanks for sign up with us.</p> <br> <img src="https://st2.depositphotos.com/3591429/6308/i/950/depositphotos_63081591-stock-photo-hands-holding-word-welcome.jpg" alt="" height="200px" width="250px"> <br> <p>Best Regards,</p> <p>Gramify Tream</p></body></html>`;

  await sendEmail(data.email, subject, html);
  return {
    success: 1,
    status: app_constants.SUCCESS,
    message: "user added successfully",
    result: add_user,
  };
};

exports.userLogIn = async (data, res) => {
  try {
    const { email, password } = data;
    const user_data = await User.findOne({ email });
    if (!user_data) {
      return {
        success: 0,
        status: app_constants.BAD_REQUEST,
        message: "Eamil does not exist",
        result: {},
      };
    }

    const password_check = await bcrypt.compare(password, user_data.password);

    if (!password_check) {
      return {
        success: 0,
        status: app_constants.BAD_REQUEST,
        message: "Invalid credentials",
        result: {},
      };
    }
    sendToken(user_data, res);
  } catch (error) {
    return {
      success: 0,
      status: app_constants.INTERNAL_SERVER_ERROR,
      message: "An error occurred during login",
      result: { error: error.message },
    };
  }
};

exports.getUser = async (data) => {
  if (!data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "User not found!",
      result: {},
    };
  }

  return {
    success: 1,
    status: app_constants.SUCCESS,
    message: "User found!",
    data,
  };
};

exports.getAllUser = async () => {
  const result = await User.find();
  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "All user list fetched succesfully",
      result,
    };
  }
  return {
    success: 0,
    status: app_constants.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
    result: {},
  };
};

exports.updateAvatar = async (req) => {
  const userData = req.user;

  if (!req.file) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "Avatar not found!",
      result: {},
    };
  }

  if (userData?.profile_pic?.public_id) {
    await cloudinary.uploader.destroy(userData?.profile_pic?.public_id);
  }

  const response = await cloudinary.uploader.upload(req.file.path, {
    folder: "Social-Avatar",
  });

  userData.profile_pic.public_id = response.public_id;
  userData.profile_pic.url = response.secure_url;

  const result = await userData.save();

  if (result) {
    fs.unlink(req.file.path, async (err) => {
      if (err) console.error("Error deleting file:", err);
    });
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "Avatar successfully uploaded!",
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

exports.updateProfile = async (req) => {
  const username = req.body.username || req.user.username;
  const bio = req.body.bio || req.user.bio;
  const fullname = req.body.fullname || req.user.fullname;

  req.user.fullname = fullname;
  req.user.username = username;
  req.user.bio = bio;

  const updatedUser = await req.user.save();

  if (!updatedUser) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "user dosen't update ",
      result: {},
    };
  }

  return {
    success: 1,
    status: app_constants.SUCCESS,
    message: "user updated successfully!",
    result: {},
  };
};

exports.followUser = async (data, auth_user_data) => {
  const auth_user_id = auth_user_data.id;

  const existing_followings = auth_user_data.following;

  const follow_user_id = data.id;

  if (auth_user_id == follow_user_id) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "can't follow userself",
      result: {},
    };
  }

  const user_data = await User.findOne({ _id: follow_user_id });
  if (!user_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "User does not exist",
      result: {},
    };
  }

  const follow_check = existing_followings.includes(follow_user_id);
  if (follow_check) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "User is already follow",
      result: {},
    };
  }

  existing_followings.push(follow_user_id);
  user_data.followers.push(auth_user_id);

  const [update_follow_user, update_auth_user] = await Promise.all([
    User.updateOne(
      { _id: follow_user_id },
      { $set: { followers: user_data.followers } }
    ),
    User.updateOne(
      { _id: auth_user_id },
      { $set: { following: existing_followings } }
    ),
  ]);
  if (update_auth_user && update_follow_user) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "user followed successfully",
      result: {},
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "Internal Server Error",
    result: {},
  };
};

exports.unfollowUser = async (data, auth_user_data) => {
  const auth_user_id = auth_user_data.id;
  const existing_followings = auth_user_data.following;
  const unfollow_user_id = data.id;

  if (auth_user_id == unfollow_user_id) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "can't unfollow userself",
      result: {},
    };
  }

  const user_data = await User.findOne({ _id: unfollow_user_id });
  if (!user_data) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "User does not exist",
      result: {},
    };
  }

  const unfollow_check = existing_followings.includes(unfollow_user_id);
  if (!unfollow_check) {
    return {
      success: 0,
      status: app_constants.BAD_REQUEST,
      message: "User is not followed!",
      result: {},
    };
  }

  // console.log("pehle ", existing_followings);

  const filtered_existing_followings = existing_followings.filter(
    (elem) => elem != unfollow_user_id
  );

  // console.log("bad  ", filtered_existing_followings);
  // console.log("pehle  ", user_data.followers);

  const filtered_followers = user_data.followers.filter(
    (elem) => elem != auth_user_id.toString()
  );
  // console.log("bad  ", filtered_followers);

  const [update_unfollow_user, update_auth_user] = await Promise.all([
    User.updateOne(
      { _id: unfollow_user_id },
      { $set: { followers: filtered_followers } }
    ),
    User.updateOne(
      { _id: auth_user_id },
      { $set: { following: filtered_existing_followings } }
    ),
  ]);

  if (update_unfollow_user && update_auth_user) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "user unfollowed successfully",
      result: {},
    };
  }

  return {
    success: 0,
    status: app_constants.SUCCESS,
    message: "Internal Server Error",
    result: {},
  };
};

exports.getFollowersList = async (user_data, data) => {
  const { userid } = data;
  const _id = userid ? userid : user_data.id;
  // console.log(_id);

  const limit = data.limit ? data.limit : 10000;
  const offset = data.offset ? data.offset : 0;
  const search = data.search ? data.search : "";

  let search_query = {};

  if (search) {
    const rejex = new RegExp(search, "i");
    search_query = {
      $or: [
        { "followers_details.username": rejex },
        { "followers_details.email": rejex },
      ],
    };
  }

  const pipeline = [
    { $match: { _id: new Types.ObjectId(_id) } },
    {
      $lookup: {
        from: "users",
        localField: "followers",
        foreignField: "_id",
        as: "followers_details",
      },
    },
    { $unwind: "$followers_details" },
    { $match: search_query },
  ];

  const [result, total_count] = await Promise.all([
    User.aggregate([
      ...pipeline,
      {
        $project: {
          _id: "$followers_details._id",
          profile_pic: "$followers_details.profile_pic.url",
          email: "$followers_details.email",
          username: "$followers_details.username",
          fullname: "$followers_details.fullname",
        },
      },
      { $skip: +offset },
      { $limit: Number(limit) },
    ]),
    User.aggregate([...pipeline, { $count: "total_count" }]),
  ]);

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "Followers list fetched succesfully",
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

exports.getFollowingsList = async (user_data, data) => {
  const anotherUser = await User.findById(data?.userid);

  // console.log(anotherUser);

  const { following } = anotherUser ? anotherUser : user_data;
  const limit = data.limit ? data.limit : 10000;
  const offset = data.offset ? data.offset : 0;
  const search = data.search ? data.search : "";

  const query = { _id: { $in: following } };
  // console.log(query);

  if (search) {
    const rejex = new RegExp(search, "i");
    query["$or"] = [{ username: rejex }, { email: rejex }];
  }

  const [result, total_count] = await Promise.all([
    User.find(query)
      .select({
        username: 1,
        fullname: 1,
        email: 1,
        profile_pic: 1,
      })
      .skip(offset)
      .limit(limit),
    User.countDocuments(query),
  ]);

  // console.log(result);

  if (result) {
    return {
      success: 1,
      status: app_constants.SUCCESS,
      message: "Followings list fetched succesfully",
      total_count: total_count,
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


exports.logoutUser = async (req, res) => {
  res.cookie("social_token", null, {
    httpOnly: true,
    expires: new Date(Date.now()), // Setting cookie expiry to current time
  });

  // console.log("User logged out")

  return {
    success: 1,
    status: app_constants.SUCCESS,
    message: "user logout successfully!",
    result: {},
  };
};
