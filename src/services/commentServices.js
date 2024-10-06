const cloudinary = require("../helpers/cloudinary");
const Comment = require("../models/commentsModel");
const app_constants = require("../constants/app.json");
const Post = require("../models/postModel");
const { Types } = require("mongoose");


exports.addComment = async (data, user_data) => {
  const { _id } = user_data;
  const { post_id, text } = data;
  // console.log(post_id, text);
  
  const parent_id = data.parent_id ? data.parent_id : null;
  
  const post_data = await Post.findOne({ _id: post_id });
  // console.log(post_data);

  if (!post_data) {
    return {
      success: 0,
      status_code: app_constants.BAD_REQUEST,
      message: "Post does not exist",
      result: {},
    };
  }

  if (parent_id) {
    const cmnt_parent_id = await Comment.findOne({ _id: parent_id });
    if (!cmnt_parent_id) {
      return {
        success: 0,
        status_code: app_constants.BAD_REQUEST,
        message: "Parent comment does not exist!",
        result: {},
      };
    }
  }

  const add_comment = await Comment.create({
    text,
    user_id: _id,
    post_id,
    parent_id,
  });

  if (add_comment) {
    return {
      success: 1,
      status_code: app_constants.SUCCESS,
      message: "Comment added successfully!",
      result: add_comment,
    };
  }

  return {
    success: 0,
    status_code: app_constants.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    result: {},
  };
};


exports.getCommentList = async (data) => {
  const { post_id } = data;

  const post_data = await Post.findOne({ _id: post_id });
  if (!post_data) {
    return {
      success: 0,
      status_code: app_constants.BAD_REQUEST,
      message: "Post does not exist",
      result: {},
    };
  }

  let result = [];


const all_comments = await Comment.aggregate([
    {$match: {post_id:  new Types.ObjectId(post_id)}},
    {
        $lookup:{
            from : "users",
            localField: "user_id",
            foreignField: "_id",
            as : "user_details"
        }
    },
    {
        $unwind: "$user_details"
    },
    {
        $sort: {updatedAt: -1}
    },
    {
        $project:{
            text : 1,
            likes:1,
            updatedAt: {$dateToString: {format:"%d-%m-%Y %H:%M:%S",date:"$updatedAt", timezone:"Asia/Kolkata"}},
            parent_id: 1,
            user_details: {
                username: "$user_details.username",
                email: "$user_details.email",
                user_id: "$user_details._id",
                profile_pic: "$user_details.profile_pic.url",
            }
        }
    }
])

const totalMainComments = await Comment.countDocuments({post_id: post_id,parent_id: null});

result = await nestedComments(all_comments , null);

  if (result) {
    return {
      success: 1,
      status_code: app_constants.SUCCESS,
      message: "Comment list fetched successfully!",
      totalMainComments,
      result,
    };
  }

  return {
    success: 0,
    status_code: app_constants.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    result: {},
  };
};

exports.updateComment = async (data) => {
    const { _id } = data;
    
    const comment_data = await Comment.findOne({ _id:_id });
    if (!comment_data) {
        return {
            success: 0,
            status_code: app_constants.BAD_REQUEST,
            message: "Comment does not exist",
            result: {},
        };
    }
    const text = data.text ? data.text: comment_data.text;

    
    let result = await Comment.updateOne({_id : _id}, { $set : {text : text}});

  
    if (result) {
      return {
        success: 1,
        status_code: app_constants.SUCCESS,
        message: "Comment list fetched successfully!",
        result,
      };
    }
  
    return {
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      result: {},
    };
};


exports.getTotalMainCount = async () => {
    const totalComment = await Comment.find({ parent_id:null });
    if (totalComment.length === 0) {
        return {
            success: 0,
            status_code: app_constants.BAD_REQUEST,
            message: "there is no any comment",
            result: {},
        };
    }

    if (totalComment.length > 0) {
      return {
        success: 1,
        status_code: app_constants.SUCCESS,
        message: "Comment list fetched successfully!",
        totalComment,
      };
    }
  
    return {
      success: 0,
      status_code: app_constants.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      result: {},
    };
};


async function getReplies(parent) {
    const parent_id = parent._id;
    const replies = await Comment.find({parent_id});

    const result = await Promise.all(replies.map(async (element)=>{
        return {
            ...element["_doc"],
            replies: await getReplies(element)
        }
    }))
    return result;
}


function nestedComments(comments,parent_id){
    return comments.filter((e)=> String(e.parent_id) == String(parent_id)).
    map(e=> {
        return {
            ...e,
            replies: nestedComments(comments,e._id)
        }
    })
}

