const { convertUtcToTimezone } = require("@helperUtils/responseUtil");
const moment = require("moment");

const formatPlaceholderProfileByLocalDate = (
  data,
  timezone = "Asia/Karachi",
) => {
  const formatted = {};

  const tasksArray = Array.isArray(data) ? data : Object.values(data).flat();

  tasksArray.forEach((task) => {
    const fullDateTime = convertUtcToTimezone(task.date, timezone);

    if (!fullDateTime) return;

    const onlyDate = moment(fullDateTime).format("YYYY-MM-DD");

    if (!formatted[onlyDate]) {
      formatted[onlyDate] = [];
    }
    formatted[onlyDate].push({
      ...task,
      date: fullDateTime,
    });
  });
  return formatted;
};
module.exports = {
  formatPlaceholderProfileByLocalDate,
};