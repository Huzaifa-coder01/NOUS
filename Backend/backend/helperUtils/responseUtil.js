const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { camelCase } = require("lodash");

const sendResponse = ({
  res,
  statusCode = 200,
  translationKey = "",
  data = null,
  meta = null,
  error = null,
  translateMessage = true,
  values = {},
}) => {
  const response = {};
  if (translateMessage) {
    let message = res?.req?.__(translationKey);

    if (!message || message.trim() === "" || message === translationKey) {
      message = keyToReadableText(translationKey);
    }

    if (values && typeof values === "object") {
      Object.keys(values).forEach((key) => {
        const placeholder = `{${key}}`;
        message = message.replace(placeholder, values[key]);
      });
    }
    response.message = message;
  } else {

    response.message = translationKey;
  }

  if (
    typeof response.message === "object" &&
    response.message !== null &&
    Object.keys(response.message).length === 0
  ) {
    response.message = "Something went wrong";
  }

  if (typeof response.message === "string" && response.message.trim() === "") {
    response.message = translationKey;
  } else if (!response.message) {
    response.message = translationKey;
  }
  if (data !== undefined && data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }
  if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "localhost") {
    if (error !== null && error !== undefined) {
      if (error instanceof Error) {
        response.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else if (typeof error === "object") {
        try {
          response.error = JSON.stringify(error);
        } catch (err) {
          response.error = "Error: Could not serialize the error object.";
        }
      } else {
        response.error = error;
      }

    }
  }
  res.status(statusCode).json(response);
};

function keyToReadableText(key) {
  if (!key || typeof key !== "string" || key.trim() === "") return "";
  const withSpaces = key.replace(/[_\.]+/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

const parsePaginationParams = (req) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }
  let skip = (page - 1) * limit;

  return { page, limit, skip };
};

const generateMeta = (page, limit, total) => {

  return {
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    totalRecords: Number(total),
    limit: Number(limit),
  };
};
const validateObjectIdsArr = (res, ids, fieldNames) => {
  const invalidParams = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const fieldName = fieldNames[i];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      invalidParams.push(fieldName);
    }
  }

  if (invalidParams.length > 0) {
    sendResponse({
      res,
      statusCode: 400,
      translationKey: "invalid_object_ids",
      values: { fields: invalidParams.join(", ") },
    });
    return false;
  }

  return true;
};

const convertUnderscoresToSpaces = (str) => String(str).replace(/_/g, " ");

const validateParams = (req, res, options = {}) => {
  const {
    queryParams = [],
    pathParams = [],
    formFields = [],
    rawData = [],
    objectIdFields = [],
    dateFields = {},
    timeFields = {},
    enumFields = {},
    minLengthFields = {},
    locationFields = {},
    notEqualFields = [],
  } = options;

  const missingParamsQuery = [];
  for (const param of queryParams) {
    if (req.query[param]) {
      req.query[camelCase(param)] = convertUnderscoresToSpaces(
        req.query[param]
      );
    } else {
      missingParamsQuery.push(param);
    }
  }

  if (missingParamsQuery.length > 0) {
    sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_query_parameters",
      values: { fields: missingParamsQuery.join(", ") },
    });
    return false;
  }

  const missingParamsPath = [];
  for (const param of pathParams) {
    if (req.params[param]) {
      req.params[camelCase(param)] = convertUnderscoresToSpaces(
        req.params[param]
      );
    } else {
      missingParamsPath.push(param);
    }
  }

  if (missingParamsPath.length > 0) {
    sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_path_parameters",
      values: { fields: missingParamsPath.join(", ") },
    });
    return false;
  }

  const missingParamsForm = [];
  for (const param of formFields) {
    if (req.body[param]) {
      req.body[camelCase(param)] = convertUnderscoresToSpaces(req.body[param]);
    } else {
      missingParamsForm.push(param);
    }
  }

  if (missingParamsForm.length > 0) {
    sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_form_fields",
      values: { fields: missingParamsForm.join(", ") },
    });
    return false;
  }

  const missingParamsRaw = [];
  for (const param of rawData) {
    const value = extractNestedFields(req.body, param);

    if (
      typeof value === "string" && value.trim() !== "" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      (typeof value === "object" && value !== null)
    ) {
    } else {
      missingParamsRaw.push(param);
    }
  }

  if (missingParamsRaw.length > 0) {
    sendResponse({
      res,
      statusCode: 400,
      translationKey: "missing_raw_fields",
      values: { fields: missingParamsRaw.join(", ") },
    });
    return false;
  }

  const objectIdsToValidate = [];
  const fieldNames = [];

  for (const field of objectIdFields) {
    let value =
      extractNestedFields(req.body, field) ||
      extractNestedFields(req.params, field) ||
      extractNestedFields(req.query, field);
    if (value) {
      if (Array.isArray(value)) {
        for (const val of value) {
          objectIdsToValidate.push(val);
          fieldNames.push(field);
        }
      } else {
        objectIdsToValidate.push(value);
        fieldNames.push(field);
      }
    }

  }
  if (!validateObjectIdsArr(res, objectIdsToValidate, fieldNames)) {
    return false;
  }

  for (const [field, format] of Object.entries(dateFields)) {
    const dateValue =
      extractNestedFields(req.body, field) ||
      extractNestedFields(req.params, field) ||
      extractNestedFields(req.query, field);
    if (dateValue) {
      const isValidDate = moment(dateValue, format, true).isValid();
      if (!isValidDate) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "invalid_date_format",
          values: { field, format },
        });
        return false;
      }
    }
  }
  for (const [field, format] of Object.entries(timeFields)) {
    const timeValue =
      extractNestedFields(req.body, field) ||
      extractNestedFields(req.params, field) ||
      extractNestedFields(req.query, field);
    if (timeValue) {
      const isValidTime = moment(timeValue, format, true).isValid();
      if (!isValidTime) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "invalid_time_format",
          values: { field, format },
        });
        return false;
      }
    } else {
      sendResponse({
        res,
        statusCode: 400,
        translationKey: "missing_time_field",
        values: { field },
      });
      return false;
    }
  }

  for (const [field, allowedValues] of Object.entries(enumFields)) {
    const value =
      extractNestedFields(req.body, field) ||
      extractNestedFields(req.params, field) ||
      extractNestedFields(req.query, field);

    if (value) {
      if (Array.isArray(value)) {
        const invalidValues = value.filter(v => !allowedValues.includes(v));
        if (invalidValues.length > 0) {
          sendResponse({
            res,
            statusCode: 400,
            translationKey: "invalid_enum_value",
            values: {
              field,
              allowedValues: allowedValues.join(", "),
              invalidValues: invalidValues.join(", ")
            },
          });
          return false;
        }
      } else {
        if (Array.isArray(allowedValues) && allowedValues.length > 0) {
          if (!allowedValues.includes(value)) {
            sendResponse({
              res,
              statusCode: 400,
              translationKey: "invalid_enum_value",
              values: { field, allowedValues: allowedValues.join(", ") },
            });
            return false;
          }
        }
      }
    }
  }


  for (const [field, minLength] of Object.entries(minLengthFields)) {
    const value = req.body[field] || req.params[field] || req.query[field];
    if (value && value.length < minLength) {
      sendResponse({
        res,
        statusCode: 400,
        translationKey: "min_length_violation",
        values: { field, minLength },
      });
      return false;
    }
  }
  for (const [field, location] of Object.entries(locationFields)) {
    const value =
      extractNestedFields(req.body, field) ||
      extractNestedFields(req.params, field) ||
      extractNestedFields(req.query, field);
    if (value) {
      const locationArray = value.split(",");
      if (locationArray.length !== 2) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "invalid_location_format",
          values: { field },
        });
        return false;
      }
      const [latitude, longitude] = locationArray;
      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "invalid_location_values",
          values: { field },
        });
        return false;
      }
    } else {
      sendResponse({
        res,
        statusCode: 400,
        translationKey: "missing_location_field",
        values: { field },
      });
      return false;
    }
  }

  // Validate groups of fields that must NOT be equal
  for (const group of notEqualFields) {

    if (!Array.isArray(group) || group.length < 2) continue;

    const values = [];
    const fieldMap = {};

    for (const field of group) {
      const value =
        extractNestedFields(req.body, field) ??
        extractNestedFields(req.params, field) ??
        extractNestedFields(req.query, field);

      if (value !== undefined && value !== null) {
        const normalized = String(value);
        values.push(normalized);
        fieldMap[normalized] = field;
      }
    }

    const seen = new Set();

    for (const val of values) {
      if (seen.has(val)) {
        sendResponse({
          res,
          statusCode: 400,
          translationKey: "fields_must_not_be_equal",
          values: { fields: group.join(", ") },
        });
        return false;
      }
      seen.add(val);
    }
  }
  return true;
};

function isValidNanoid(id) {
  const nanoidRegex = /^[A-Za-z0-9_-]{21}$/;
  return nanoidRegex.test(id);
}

const extractNestedFields = (obj, fieldPath) => {
  const fields = fieldPath.split(".");
  let value = obj;

  for (const field of fields) {
    if (value !== null && value !== undefined && value[field] !== undefined) {
      value = value[field];
    } else {
      return null;
    }
  }
  return value;
};


const exampleMiddleware = (req, res, next) => {
  const validationOptions = {
    queryParams: ["some_query_param"],
    pathParams: ["some_path_param"],
    formFields: ["title", "description", "image"],
    objectIdFields: ["userId", "postId"],
  };

  if (!validateParams(req, res, validationOptions)) {
    return;
  }

  next();
};





const convertUtcToTimezoneAMPM = (
  date,
  timezone,
  outputFormat = "hh:mm A",
  inputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ"
) => {
  if (!date || !moment(date, inputFormat, true).isValid()) {
    console.error("Invalid date format:", date);
    return "Invalid Date";
  }

  const momentDate = moment(date, inputFormat, true);

  if (timezone) {
    return momentDate.tz(timezone).format(outputFormat);
  } else {
    // Simply format the date without timezone conversion
    return momentDate.format(outputFormat);
  }
};




const convertUtcToTimezone = (
  date,
  timezone,
  outputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ",
  inputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ"
) => {
  const momentDate =
    date instanceof Date
      ? moment.utc(date)
      : moment.utc(date, inputFormat, true);

  if (timezone) {
    return momentDate.tz(timezone).format(outputFormat);
  } else {
    return momentDate.format(outputFormat);
  }
};

const convertTimezoneToUtc = (
  date,
  timezone,
  inputFormat = "YYYY-MM-DD hh:mm A",
  outputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ"
) => {
  const momentDate = moment.tz(date, inputFormat, timezone).utc();
  return momentDate.format(outputFormat);
};
const convertToUtcDateOnly = (date, timezone, inputFormat = "YYYY-MM-DD") => {


  const momentDate = moment.tz(date, inputFormat, timezone);

  // Format the date in the given timezone without changing the time zone
  return momentDate.format("YYYY-MM-DD[T]HH:mm:ss.SSS[+00:00]");
};
const extractTime = (datetime) => {
  return moment.utc(datetime).format("HH:mm");
};
const convertTimezoneToUtcDateOnly = (
  date,
  timezone,
  inputFormat = "YYYY-MM-DD hh:mm A"
) => {
  const momentDate = moment.tz(date, inputFormat, timezone).utc();

  const year = momentDate.year();
  const month = momentDate.month();
  const day = momentDate.date();

  const utcMidnight = moment
    .utc([year, month, day])
    .format("YYYY-MM-DD[T]HH:mm:ss.SSS[+00:00]");

  return utcMidnight;
};
const convertToUtcTime = (bookingDate, slotStartTime, slotEndTime, timezone) => {
  const startDateTime = moment.tz(`${bookingDate} ${slotStartTime}`, "YYYY-MM-DD HH:mm", timezone).utc();
  
  const endDateTime = moment.tz(`${bookingDate} ${slotEndTime}`, "YYYY-MM-DD HH:mm", timezone).utc();

  const slotStartUtc = startDateTime.format("HH:mm");
  const slotEndUtc = endDateTime.format("HH:mm");

  return { slotStartUtc, slotEndUtc };
};

const getCurrentDateInTimezone = ({
  timezone,
  isDateOnly = false,
  format = "YYYY-MM-DDTHH:mm:ss.SSSZ",
}) => {
  if (!timezone) {
    throw new Error("Timezone is required");
  }

  let now = moment().tz(timezone);

  if (isDateOnly) {
    now = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  }

  return now.toDate();
};


const getStartAndEndOfDay = (date, timezone) => {
  const start = moment.tz(date, timezone)
    .startOf("day")
    .utc()
    .toDate();

  const end = moment.tz(date, timezone)
    .endOf("day")
    .utc()
    .toDate();

  return { start, end };
};



const getStartAndEndOfWeek = (date, timezone) => {
  const start = moment.tz(date, timezone).startOf("week").toDate();
  const end = moment.tz(date, timezone).endOf("week").toDate();
  return { start, end };
};
const getStartAndEndOfMonth = (date, timezone) => {
  const start = moment.tz(date, timezone).startOf("month").toDate();
  const end = moment.tz(date, timezone).endOf("month").toDate();
  return { start, end };
};


const convertDateFormat = (
  date,
  outputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ",
  inputFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ"
) => {
  const momentDate = moment(date, inputFormat, true);

  // Simply format the date without timezone conversion
  return momentDate.format(outputFormat);
};

const getReadableErrorMessage = (error) => {
  const statusCode =
    error.name === "ValidationError"
      ? 400
      : error.code === 11000
        ? 409
        : 500;

  if (error.code === 11000 && error.message.includes("dup key")) {
    const match = error.message.match(/dup key: { (.+) }/);
    if (match && match[1]) {
      const fields = match[1].split(",").map((f) => f.trim());
      const fieldMessages = fields.map((field) => {
        const [key, value] = field.split(":").map((s) => s.trim());
        let cleanValue = value;
        if (/^ObjectId\(['"](.+)['"]\)$/.test(value)) {
          cleanValue = value.match(/^ObjectId\(['"](.+)['"]\)$/)[1];
        } else if (/^"(.+)"$/.test(value)) {
          cleanValue = value.replace(/^"(.+)"$/, "$1");
        }
        return `${key} '${cleanValue}'`;
      });
      return {
        code: 11000,
        statusCode,
        message: `A record with ${fieldMessages.join(" and ")} already exists.`,
      };
    }
    return { code: 11000, statusCode, message: "duplicate_value" };
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e) => {
      let fullPath = e.path || (e.properties && e.properties.path) || "";
      let match = error.message.match(
        new RegExp(`([\\w\\.]+):\\s*Path \`${e.path}\` is required`)
      );
      if (match && match[1]) {
        fullPath = match[1];
      }
      if (fullPath) {
        return `Path \`${fullPath}\` is required.`;
      }
      return e.message;
    });
    return {
      code: null,
      statusCode,
      message: messages.length ? messages.join(", ") : error.message,
    };
  }

  return { code: error.code || null, statusCode, message: error.message };
};
const getCurrentUtcDateOnly = () => {
  const now = new Date();
  function getEndDate(pricingPlan, startDate = new Date()) {
    if (!pricingPlan || pricingPlan === "free") return null;

    const start = new Date(startDate);

    if (pricingPlan === "monthly") {
      return new Date(start.setMonth(start.getMonth() + 1));
    }
    if (pricingPlan === "yearly") {
      return new Date(start.setFullYear(start.getFullYear() + 1));
    }

    return null;
  }
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
};
const getEndDate = (pricingPlan, startDate = new Date()) => {
  if (!pricingPlan || pricingPlan === "free") return null;

  const start = new Date(startDate);

  if (pricingPlan === "monthly") {
    return new Date(start.setMonth(start.getMonth() + 1));
  }

  if (pricingPlan === "yearly") {
    return new Date(start.setFullYear(start.getFullYear() + 1));
  }

  return null;
};


const fireAndForget = (promise, label) => {
  promise.catch((err) =>
    console.error(`[${label}] failed:`, err)
  );
};
const convertToTimeZone = (date, time, timezone) => {
  const dateTime = moment.utc(`${date} ${time}`, "YYYY-MM-DD HH:mm").tz(timezone);
  if (!dateTime.isValid()) {
    console.error("Invalid Date");
    return null;
  }
  const slotInTimezone = dateTime.format(" HH:mm");
  return slotInTimezone;
};
const convertToUTC = (dates, times, timezone = "Asia/Karachi") => {
  if (dates.length !== times.length) {
    console.error("The date and time arrays must have the same length");
    return null;
  }

  const convertedDates = [];
  const convertedTimes = [];

  dates.forEach((date, index) => {
    const time = times[index];

    const localDateTime = moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", timezone);

    if (!localDateTime.isValid()) {
      console.error("Invalid Date");
      return null;
    }

    const utcDate = localDateTime.utc().format("YYYY-MM-DD");
    const utcTime = localDateTime.utc().format("HH:mm");

    convertedDates.push(utcDate);
    convertedTimes.push(utcTime);
  });

  return { convertedDates, convertedTimes };
};
module.exports = {
  sendResponse,
  parsePaginationParams,
  generateMeta,
  validateObjectIdsArr,
  validateParams,
  isValidNanoid,
  exampleMiddleware,
  convertUtcToTimezone,
  convertTimezoneToUtc,
  convertDateFormat,
  getCurrentDateInTimezone,
  getReadableErrorMessage,
  getStartAndEndOfDay,
  getStartAndEndOfWeek,
  getStartAndEndOfMonth,
  convertUtcToTimezoneAMPM,
  convertTimezoneToUtcDateOnly,
  getCurrentUtcDateOnly,
  convertToUtcDateOnly,
  extractTime,
  getEndDate,
  fireAndForget,
  convertToUtcTime,
  convertToTimeZone,
  convertToUTC
};
