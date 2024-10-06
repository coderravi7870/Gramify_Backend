const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  username: { type: String, required: true, min: 6, max: 30 },
  fullname: { type: String, required: true, min: 6, max: 30 },
  email: { type: String, required: true,unique: true},
  token:{type:String, default:""},
  otp:{type:Number, default:null},
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  profile_pic: { 
    public_id:{type:String},
    url:{type:String},
   },
  followers: [{ type: Schema.ObjectId, ref: "user", default: [] }],
  following: [{ type: Schema.ObjectId, ref: "user", default: [] }],
});

const User = model("user", UserSchema);
module.exports = User;
