const {
  sendResponse,
  parsePaginationParams,
  validateParams,
  getReadableErrorMessage,
} = require("../../../helperUtils/responseUtil");
const PdfService = require("./pdfService");
const { PDF_STATUSES, PDF_UPDATABLE_STATUSES } = require("./PdfModel");

const NOT_FOUND_ERRORS = [
  "course_not_found",
  "level_not_found",
  "subject_not_found",
  "chapter_not_found",
  "pdf_not_found",
];

// The client posts the stored upload key as `file`, the model keeps it as
// `fileName`. Accept either so both create and update work.
const normalizeFileField = (req) => {
  if (req.body && req.body.fileName === undefined && req.body.file !== undefined) {
    req.body.fileName = req.body.file;
  }
};

const makePdfController = ({
  type,
  key,
  chapterRequired,
  studentCanCreate,
  readTypes,
}) => {
  const notFoundKey = `${key}_not_found`;
  const listTypes = readTypes || type;

  const create = async (req, res) => {
    normalizeFileField(req);
    const { name, fileName, subjectId, chapterId } = req.body;
    const isAdmin = req.user.userType === "admin";

    if (!isAdmin && !studentCanCreate) {
      return sendResponse({
        res,
        statusCode: 403,
        translationKey: "only_admin_can_perform_this_action",
      });
    }

    const rawData = ["name", "fileName"];
    rawData.push(chapterRequired ? "chapterId" : "subjectId");

    if (
      !validateParams(req, res, {
        rawData,
        objectIdFields: ["subjectId", "chapterId"],
      })
    )
      return;

    try {
      const pdf = await PdfService.createPdf({
        type,
        name,
        fileName,
        subjectId,
        chapterId,
        uploadedBy: req.user._id,
        requireActiveChain: !isAdmin,
      });

      if (!pdf) {
        return sendResponse({
          res,
          statusCode: 400,
          translationKey: `${key}_creation_failed`,
        });
      }

      if (pdf.error) {
        return sendResponse({
          res,
          statusCode: NOT_FOUND_ERRORS.includes(pdf.error) ? 404 : 400,
          translationKey: pdf.error,
        });
      }

      return sendResponse({
        res,
        statusCode: 201,
        translationKey: `${key}_created_successfully`,
        data: pdf,
      });
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      return sendResponse({
        res,
        statusCode: readableError.statusCode,
        translationKey: readableError.message,
        error,
      });
    }
  };

  const list = async (req, res) => {
    const { page, limit } = parsePaginationParams(req);
    let { keyword, status, courseId, levelId, subjectId, chapterId, uploadedBy } =
      req.query;
    const { mine } = req.query;
    const isAdmin = req.user.userType === "admin";

    if (
      !validateParams(req, res, {
        objectIdFields: ["courseId", "levelId", "subjectId", "chapterId", "uploadedBy"],
        enumFields: { status: PDF_STATUSES },
      })
    )
      return;

    if (!isAdmin) {
      status = "active";
      uploadedBy = mine === "true" ? req.user._id : undefined;
    }

    try {
      const { pdfs, meta } = await PdfService.getPdfs({
        type: listTypes,
        page,
        limit,
        keyword,
        status,
        courseId,
        levelId,
        subjectId,
        chapterId,
        uploadedBy,
      });

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: `${key}_fetched_successfully`,
        data: pdfs,
        meta,
      });
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      return sendResponse({
        res,
        statusCode: readableError.statusCode,
        translationKey: readableError.message,
        error,
      });
    }
  };

  const details = async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user.userType === "admin";

    if (
      !validateParams(req, res, {
        pathParams: ["id"],
        objectIdFields: ["id"],
      })
    )
      return;

    try {
      const pdf = await PdfService.getPdfDetails(id, listTypes, {
        onlyActive: !isAdmin,
      });

      if (!pdf) {
        return sendResponse({
          res,
          statusCode: 404,
          translationKey: notFoundKey,
        });
      }

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: `${key}_fetched_successfully`,
        data: pdf,
      });
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      return sendResponse({
        res,
        statusCode: readableError.statusCode,
        translationKey: readableError.message,
        error,
      });
    }
  };

  const update = async (req, res) => {
    normalizeFileField(req);
    const { id } = req.params;
    const { name, fileName, status } = req.body;

    if (
      !validateParams(req, res, {
        pathParams: ["id"],
        objectIdFields: ["id"],
        enumFields: { status: PDF_UPDATABLE_STATUSES },
      })
    )
      return;

    try {
      const updated = await PdfService.updatePdf(id, type, {
        name,
        fileName,
        status,
      });

      if (updated && updated.error) {
        return sendResponse({
          res,
          statusCode: updated.error === "pdf_not_found" ? 404 : 400,
          translationKey:
            updated.error === "pdf_not_found" ? notFoundKey : updated.error,
        });
      }

      if (!updated) {
        return sendResponse({
          res,
          statusCode: 404,
          translationKey: notFoundKey,
        });
      }

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: `${key}_updated_successfully`,
        data: updated,
      });
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      return sendResponse({
        res,
        statusCode: readableError.statusCode,
        translationKey: readableError.message,
        error,
      });
    }
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (
      !validateParams(req, res, {
        pathParams: ["id"],
        objectIdFields: ["id"],
      })
    )
      return;

    try {
      const deleted = await PdfService.deletePdf(id, type);

      if (!deleted) {
        return sendResponse({
          res,
          statusCode: 404,
          translationKey: notFoundKey,
        });
      }

      return sendResponse({
        res,
        statusCode: 200,
        translationKey: `${key}_deleted_successfully`,
      });
    } catch (error) {
      const readableError = getReadableErrorMessage(error);
      return sendResponse({
        res,
        statusCode: readableError.statusCode,
        translationKey: readableError.message,
        error,
      });
    }
  };

  return { create, list, details, update, remove };
};

module.exports = { makePdfController };
