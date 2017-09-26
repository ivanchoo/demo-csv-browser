import m from "moment";

let _counter = 1;

export const randomId = (prefix = "randomId") => `${prefix}-${_counter++}`;

export const noop = () => {};

/**
 * Returns a UTC Date object base on ISO date format.
 * @param  {String} d e.g. '2017-09-25'
 * @return {Date}
 */
export const toDate = d => m.utc(d, "YYYY-MM-DD").toDate();

export const fromDate = d =>
  m(d)
    .utc()
    .format("YYYY-MM-DD");

/**
 * Returns a UTC Date object base on ISO datetime format.
 * @param  {String} dt e.g. '2017-09-25T12:00:00'
 * @return {Date}
 */
export const toDatetime = dt => m.utc(dt, "YYYY-MM-DDTHH:mm:ss").toDate();

/**
 * Reverse of `toDatetime`
 * @param {Date} dt Date
 * @return  {String} e.g. '2017-09-25T12:00:00'
 */
export const fromDatetime = dt => {
  if (!dt) return "";
  const d = m(dt);
  return d.isValid() ? d.format("YYYY-MM-DDTHH:mm:ss") : "";
};
