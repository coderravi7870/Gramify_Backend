const express = require("express");
const postRoute = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const postController = require("../controllers/postController");
const middleware = require("../middlewares/authMiddleware");

postRoute.post("/upload",middleware.verifyToken,upload.single("file"),postController.uploadPost);
postRoute.delete("/delete-post/:id",middleware.verifyToken,postController.DeletePost);

postRoute.get("/list", middleware.verifyToken, postController.getPostList);



postRoute.get("/getallpost", postController.getAllPostList);

postRoute.post("/update",middleware.verifyToken,upload.single("file"),postController.updatePost);

postRoute.post("/like", middleware.verifyToken, postController.likePost);

postRoute.get("/likes/list", middleware.verifyToken, postController.getPostLikeList);

postRoute.get("/download/:postid", middleware.verifyToken, postController.downloadPost);

module.exports = postRoute; 
