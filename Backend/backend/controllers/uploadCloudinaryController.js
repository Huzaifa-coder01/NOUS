const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { sendResponse } = require("../helperUtils/responseUtil");
const { uploads3Mw } = require("../middlewares/uploadFilesAWSMw");
const {
  getCloudinary,
  isCloudinaryConfigured,
  getUploadFolder,
} = require("../config/cloudinary");

const MAX_CONCURRENT_UPLOADS = 5;

const runWithConcurrency = async (tasks, concurrency) => {
  const results = new Array(tasks.length);
  let next = 0;

  const worker = async () => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
};

const uploadBuffer = (cloudinary, file, publicId, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: folder || undefined,
        resource_type: "auto",
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });

const uploadFilesToCloudinary = async (files) => {
  const cloudinary = getCloudinary();
  const folder = getUploadFolder();

  const tasks = files.map((file) => async () => {
    if (!file.buffer) {
      throw new Error("file_buffer_is_missing");
    }

    const fileExtension = path.extname(file.originalname);
    const publicId = uuidv4();

    const result = await uploadBuffer(cloudinary, file, publicId, folder);

    const format = result.format ? `.${result.format}` : fileExtension;
    const key = `${result.public_id}${format}`;

    return {
      fileName: key,
      fileExtension: format,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  });

  return runWithConcurrency(tasks, MAX_CONCURRENT_UPLOADS);
};

const uploadFiles = (req, res) => {
  if (!isCloudinaryConfigured()) {
    return sendResponse({
      res,
      statusCode: 503,
      translationKey: "cloudinary_not_configured",
    });
  }

  uploads3Mw(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (
        err.code === "LIMIT_FILE_COUNT" ||
        err.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        return sendResponse({
          res,
          statusCode: 400,
          translationKey: "limit_exceeding_max_files",
          error: err.message,
        });
      }
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "file_upload",
        values: {
          errorMessage: err.message,
        },
        error: err,
      });
    } else if (err) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "file_upload",
        values: {
          errorMessage: err.message,
        },
        error: err,
      });
    } else if (!req.files || req.files.length === 0) {
      return sendResponse({
        res,
        statusCode: 400,
        translationKey: "no_files",
      });
    }

    try {
      const uploadedFiles = await uploadFilesToCloudinary(req.files);

      const response =
        uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles;

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "files_uploaded",
        data: response,
      });
    } catch (error) {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "cloudinary_upload",
        values: {
          error: error.message,
        },
        error,
      });
    }
  });
};

const toPublicId = (fileKey) => {
  let key = String(fileKey).trim();

  if (key.startsWith("http")) {
    const withoutQuery = key.split("?")[0];
    const afterUpload = withoutQuery.split("/upload/")[1] || "";
    key = afterUpload.replace(/^v\d+\//, "");
  }

  const extension = path.extname(key);
  return extension ? key.slice(0, -extension.length) : key;
};

const deleteFileFromCloudinary = async (cloudinary, fileKey) => {
  const publicId = toPublicId(fileKey);

  for (const resourceType of ["image", "video", "raw"]) {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    if (result?.result === "ok") {
      return result;
    }
  }

  throw new Error(`Failed to delete file: ${publicId}`);
};

const deleteFiles = async (req, res) => {
  const { fileKey } = req.body;

  if (!fileKey) {
    return sendResponse({
      res,
      statusCode: 400,
      translationKey: "file_key",
      error: "File key is missing.",
    });
  }

  if (!isCloudinaryConfigured()) {
    return sendResponse({
      res,
      statusCode: 503,
      translationKey: "cloudinary_not_configured",
    });
  }

  try {
    const cloudinary = getCloudinary();

    if (Array.isArray(fileKey)) {
      await Promise.all(
        fileKey.map((key) => deleteFileFromCloudinary(cloudinary, key)),
      );
      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "files_deleted",
        data: { fileKeys: fileKey },
      });
    }

    await deleteFileFromCloudinary(cloudinary, fileKey);
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "file_deleted",
      data: { fileKey },
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "file_deletion",
      error,
    });
  }
};

module.exports = {
  uploadFiles,
  deleteFiles,
  uploadFilesToCloudinary,
};
