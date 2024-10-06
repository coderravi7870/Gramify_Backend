const { Schema, model } = require("mongoose");

const statusSchema = new Schema({
    user: {
      type: String,
      ref: 'User',
      required: true
    },
    content: {
      type: String, // Can be text, image URL, or video URL
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'video'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // Status will expire after 24 hours (in seconds)
    },
    viewers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  });

const Status = model("status", statusSchema);
module.exports = Status;