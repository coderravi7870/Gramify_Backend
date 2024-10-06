const express = require("express");
const userRoute = express.Router();
const multer = require("multer");
const upload = multer({ dest: "avatar/" });

const userController = require("../controllers/userController");
const middleware = require("../middlewares/authMiddleware");

userRoute.post("/signup", userController.userSignUp);
userRoute.post("/login", userController.userLogIn);


userRoute.get("/getuser",middleware.verifyToken,userController.getUser);

userRoute.get("/getalluser", userController.getAllUser);

userRoute.put("/update-avatar",upload.single("avatar"),middleware.verifyToken,userController.updateAvatar);

userRoute.put("/profile/update",middleware.verifyToken,userController.updateProfile);

userRoute.post("/follow", middleware.verifyToken, userController.followUser);

userRoute.post("/unfollow",middleware.verifyToken,userController.unfollowUser);

userRoute.get("/followers/list",middleware.verifyToken,userController.getFollowersList);

userRoute.get("/followings/list",middleware.verifyToken,userController.getFollowingsList);


userRoute.post("/logout",middleware.verifyToken,userController.logoutUser);

module.exports = userRoute;
