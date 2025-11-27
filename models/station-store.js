import { v4 as uuid } from "uuid"; // uuid: built-in helper to generate unique ids for stations/reports

// in-memory list of stations while server runs
// resets if server restarts
const stations = [];

export const stationStore = {
  // create station and add to list
  async create(stationData) {
    const station = {
      _id: uuid(), // unique id for each station
      userId: String(stationData.userId), // owner of the station
      name: String(stationData.name || "").trim(), // city/station name
      lat: stationData.lat ? Number(stationData.lat) : null, // latitude
      lng: stationData.lng ? Number(stationData.lng) : null, // longitude
      reports: [], // store manual weather readings
    };

    stations.push(station); // save in memory list
    return station; // return new station to controller
  },

  // lookup station by id
  async findById(id) {
    return stations.find((s) => s._id === id) || null;
  },

  // return only stations for a user
  async findByUser(userId) {
    return stations.filter((s) => s.userId === String(userId));
  },

  // return all stations (dashboard uses this)
  async getAllStations() {
    return stations;
  },

  // delete one station by id
  async delete(id) {
    const index = stations.findIndex((s) => s._id === id);
    if (index >= 0) stations.splice(index, 1);
  },

  // clear all stations
  async deleteAll() {
    stations.length = 0;
  },

  // add manual weather report to a station
  async addReport(stationId, reportData) {
    const station = await this.findById(stationId);
    if (!station) return null; // exit if station missing

    const report = {
      _id: uuid(), // unique report id
      time: new Date().toISOString(), // timestamp for sorting/display
      code: Number(reportData.code), // weather code
      temp: Number(reportData.temp), // temperature
      windSpeed: Number(reportData.windSpeed), // wind speed
      windDir: Number(reportData.windDir), // wind direction (deg)
      pressure: Number(reportData.pressure), // air pressure
    };

    station.reports.push(report); // save report in station
    console.log(`report added for ${station.name}, total:`, station.reports.length);
    return report;
  },

  // delete a manual weather report from a station
  async deleteReport(stationId, reportId) {
    const station = await this.findById(stationId);
    if (!station || !station.reports) return;

    station.reports = station.reports.filter((r) => r._id !== reportId);
    console.log(`report deleted for ${station.name}, remaining:`, station.reports.length);
  },
};
