import { v4 as uuid } from "uuid";

// all reports are stored here
const reports = [];

// convert input to number or null if invalid/empty
function toNumberOrNull(value) {
  if (value === "" || value === undefined || value === null) {
    return null; // empty or missing input
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null; // valid number check
}

// return time from input or current time now
function timeOrNow(time) {
  return time ? String(time) : new Date().toISOString(); // if no time passed, use now
}

export const reportStore = {
  // create a new weather report for a station
  async create(reportData) {
    const report = {
      _id: uuid(), // unique report id
      stationId: String(reportData.stationId), // station owner
      code: toNumberOrNull(reportData.code), // weather code
      temp: toNumberOrNull(reportData.temp), // temperature
      windSpeed: toNumberOrNull(reportData.windSpeed), // wind km/h
      windDir: toNumberOrNull(reportData.windDir), // wind degrees
      pressure: toNumberOrNull(reportData.pressure), // air pressure
      time: timeOrNow(reportData.time), // timestamp
      icon: reportData.icon || null, // icon or null
    };

    reports.push(report); // save to memory list
    console.log(`report saved for station ${report.stationId}, total:`, reports.length);
    return report; // return new report to controller
  },

  // get all reports for one station sorted newest first
  async findByStationId(stationId) {
    const stationIdText = String(stationId);
    const result = []; // store matching reports

    for (const report of reports) {
      if (report.stationId === stationIdText) {
        result.push(report); // match found
      }
    }

    // sort newest reading first using time
    result.sort((a, b) => new Date(b.time) - new Date(a.time));
    return result;
  },

  // delete one report by id
  async delete(reportId) {
    const index = reports.findIndex((r) => r._id === reportId);
    if (index >= 0) {
      reports.splice(index, 1); // remove from memory
      console.log(`report removed, id:`, reportId);
    }
  },

  // delete all reports for a station
  async deleteByStation(stationId) {
    const stationIdText = String(stationId);

    for (let i = reports.length - 1; i >= 0; i--) {
      if (reports[i].stationId === stationIdText) {
        reports.splice(i, 1); // remove station reports
      }
    }

    console.log(`all reports cleared for station`, stationId);
  },
};