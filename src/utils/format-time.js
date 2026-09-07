import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// ----------------------------------------------------------------------

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Docs: https://day.js.org/docs/en/display/format
 */
export const formatStr = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  // UK locale format (this project runs in the UK) - use these for any
  // date rendered in tables so dates read as 31/12/1999, not US-style.
  uk: {
    dateTime: 'DD/MM/YYYY h:mm a', // 31/12/1999 12:00 am
    date: 'DD/MM/YYYY', // 31/12/1999
  },
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function today(format) {
  return dayjs(new Date()).startOf('day').format(format);
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022 12:00 am
 */
export function fDateTime(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.dateTime) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022
 */
export function fDate(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.date) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 12:00 am
 */
export function fTime(date, format) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.time) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 1713250100
 */
export function fTimestamp(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).valueOf() : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: a few seconds, 2 years
 */
export function fToNow(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).toNow(true) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 31/12/1999
 */
export function fDisplayDate(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(formatStr.uk.date) : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 11.59 p.m.
 */
export function fDisplayTime(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format('h.mm A').replace('AM', 'a.m.').replace('PM', 'p.m.')
    : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: 31/12/1999, 11.59 p.m.
 */
export function fDisplayDateTime(date) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? `${fDisplayDate(date)}, ${fDisplayTime(date)}` : 'Invalid time value';
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsBetween(inputDate, startDate, endDate) {
  if (!inputDate || !startDate || !endDate) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (formattedInputDate && formattedStartDate && formattedEndDate) {
    return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
  }

  return false;
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsAfter(startDate, endDate) {
  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsSame(startDate, endDate, units) {
  if (!startDate || !endDate) {
    return false;
  }

  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  if (!isValid) {
    return 'Invalid time value';
  }

  return dayjs(startDate).isSame(endDate, units ?? 'year');
}

// ----------------------------------------------------------------------

/** output:
 * Same day: 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same year: 25 Apr - 26 May 2024
 */
export function fDateRangeShortLabel(startDate, endDate, initial) {
  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  const isAfter = fIsAfter(startDate, endDate);

  if (!isValid || isAfter) {
    return 'Invalid time value';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}
