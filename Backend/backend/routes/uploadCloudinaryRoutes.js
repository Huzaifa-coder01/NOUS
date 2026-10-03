const express = require("express");
const {
  uploadFiles,
  deleteFiles,
} = require("../controllers/uploadCloudinaryController");

const router = express.Router();

router.post("/", uploadFiles);

router.delete("/", deleteFiles);

module.exports = router;
