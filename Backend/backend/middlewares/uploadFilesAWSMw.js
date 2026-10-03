const multer = require("multer");


const storage = multer.memoryStorage();

const uploads3Mw = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).array("files", 10);

function checkFileType(file, cb) {
  cb(null, true);

}


module.exports = {
  uploads3Mw,
};
