const cloudinary = require("../helpers/cloudinary");
const app_constants = require("../constants/app.json");
const Status = require("../models/statusModel");
const { Types } = require("mongoose");

exports.addStatus = async (req) => {
  const { content, mediaType } = req.body;

  const userId = req.user._id; 

  let mediaUrl = null;
  let public_id = null;


  // If mediaType is image or video, upload it to Cloudinary
  if (mediaType === "image" || mediaType === "video") {
    if (!req.file) {
      return {
        success: 0,
        status: app_constants.BAD_REQUEST,
        message: "No media file provided",
        result: {},
      };
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: mediaType,
      folder: "Social_status",
    });
    // console.log("Ram Ram");

    mediaUrl = result.secure_url;
    public_id = result.public_id;
  }
  // console.log("mediaUrl: " + mediaUrl);


  const status = await Status.create({
    user: userId,
    content: mediaUrl || content,
    public_id: public_id,
    mediaType: mediaType || "text",
  });
  // console.log(status);


  if (status) {
    return {
      success: 1,
      status_code: app_constants.SUCCESS,
      message: "Status added successfully!",
      status,
    };
  }

  return {
    success: 0,
    status_code: app_constants.INTERNAL_SERVER_ERROR,
    message: "Unable to add status",
    result: {},
  };
};

exports.getStatusList = async (req) => {
  const currentTime = new Date();
  const cutoffTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

  const allStatus = await Status.find({
    createdAt: { $gte: cutoffTime.toISOString() } 
  }).sort({ createdAt: -1 });



  if (allStatus.length > 0) {
    return {
      success: 1,
      status_code: app_constants.SUCCESS,
      message: "Statuses fetched successfully!",
      allStatus,
    };
  }

  return {
    success: 0,
    status_code: app_constants.INTERNAL_SERVER_ERROR,
    message: "No active statuses found",
    result: {},
  };
};

exports.deleteStatus = async (req) => {

  const allStatus = await Status.findById(req.params.statusId)

  if(allStatus.user !== req.user._id.toString()) {
     return {
    success: 0,
    status_code: app_constants.BAD_REQUEST_,
    message: "You can't delete this status!",
    result: {},
  };
    
  }

  if (allStatus?.public_id) {
    await cloudinary.uploader.destroy(allStatus?.public_id);
  }

  const deleteStatus = await Status.deleteOne({_id:req.params.statusId});
  
  if(deleteStatus){
    return {
      success: 1,
      status_code: app_constants.SUCCESS,
      message: "Status deleted successfully!",
      result: {},
    }
  }

  return {
    success: 0,
    status_code: app_constants.INTERNAL_SERVER_ERROR,
    message: "No active statuses found",
    result: {},
  };
};
