import moment from "moment-timezone";

export const convertTimezone = (date: string, timezone: string) => {
  return moment(date).tz(timezone).format();
};
