const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    file: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    caption: { type: String },
    user_id: { type: Schema.ObjectId, ref: "user", required: true },
    likes: [{ type: Schema.ObjectId, ref: "user", default: [] }],
  },
  { timestamps: true }
);

const Post = model("post", postSchema);
module.exports = Post;
