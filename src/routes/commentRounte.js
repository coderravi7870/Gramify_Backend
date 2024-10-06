const express = require("express");
const commentRounte = express.Router();
const middleware = require("../middlewares/authMiddleware");

const commentController = require("../controllers/commentController");

commentRounte.post("/add",middleware.verifyToken,commentController.addComment);
commentRounte.get("/list",middleware.verifyToken,commentController.getCommentList);
commentRounte.post("/updatecomment",middleware.verifyToken,commentController.updateComment);
commentRounte.get("/totalmaincount",middleware.verifyToken,commentController.getTotalMainCount);

module.exports = commentRounte;
