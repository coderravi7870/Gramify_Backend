const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    user_id: { type: Schema.ObjectId, ref: "user", required: true },
    post_id: { type: Schema.ObjectId, ref: "post", required: true },
    likes: [{ type: Schema.ObjectId, ref: "user", default: [] }],
    parent_id: { type: Schema.ObjectId, ref: "comment", default: null },
  },
  { timestamps: true }
);

const Commnet = model("comment", commentSchema);
module.exports = Commnet;
