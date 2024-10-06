const express = require("express");
const statusRoute = express.Router();
const middleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const statusController = require("../controllers/statusController");

statusRoute.post("/upload",middleware.verifyToken,upload.single("status"),statusController.addStatus);

statusRoute.get("/allStatus_list",middleware.verifyToken,statusController.getStatusList);
statusRoute.delete("/delete/:statusId",middleware.verifyToken,statusController.deleteStatus);


module.exports = statusRoute;