const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const buildMonthlyRevenue = (rows = []) => {
  const map = {};
  let total = 0;

  rows.forEach((r) => {
    map[r.month] = r.totalRevenue;
    total += r.totalRevenue || 0;
  });

  const monthsArray = months.map((m, i) => ({
    month: m,
    totalRevenue: map[i + 1] || 0,
  }));

  return { monthsArray, total };
};

const buildRevenueOverTime = (data = {}) => {
  const { monthsArray: thisYear, total: totalThisYear } = buildMonthlyRevenue(
    data.thisYearRevenue,
  );

  const { monthsArray: lastYear, total: totalLastYear } = buildMonthlyRevenue(
    data.lastYearRevenue,
  );

  return {
    thisYear,
    lastYear,
    totalThisYear,
    totalLastYear,
  };
};

module.exports = { buildRevenueOverTime };
