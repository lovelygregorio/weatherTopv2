// reportcontroller handles manual weather report create/delete for stations.
import { v4 as uuid } from "uuid"; // uuid gives each report a unique id.
import { stationStore } from "../models/station-store.js"; // station json/in-memory store
// stationstore is imported using ../ because store file is one folder up.

export const reportController = {
  // save a new manual weather reading to a station
  async createReport(request, response) {
    try {
      const stationId = request.params.id; // read station id from url
      const station = await stationStore.findById(stationId); // lookup station

      if (!station) { // exit early if station missing
        return response.render("error-view", {
          title: "report error",
          message: "station not found",
        });
      }
  
      // form fields (code, temp, windspeed, winddir, pressure) come from station page form.
      console.log("submit report body:", request.body); // log form data

      // build new report from form fields
      const newReport = {
        _id: uuid(), // unique report id
        time: new Date().toISOString(), // current timestamp
        code: Number(request.body.code), // weather code
        temp: Number(request.body.temp), // temperature
        windSpeed: Number(request.body.windSpeed), // wind speed km/h
        windDir: Number(request.body.windDir), // wind direction deg
        pressure: Number(request.body.pressure), // air pressure hpa
      };

      // call store to save report into station.reports[]
      // after save/delete, page redirects back to the station view.
      await stationStore.addReport(stationId, request.body);

      return response.redirect(`/station/${stationId}`); // go back to station page
    } catch (error) {
      console.error("error creating report:", error); // log error
      return response.render("error-view", {
        title: "report error",
        message: error.message,
      });
    }
  },

  // delete one manual report by id
  async deleteReport(request, response) {
    try {
      const stationId = request.params.id; // station id from url
      const reportId = request.params.reportId; // report id from url

      // remove report from store
      await stationStore.deleteReport(stationId, reportId);

      return response.redirect(`/station/${stationId}`); // refresh station page
    } catch (error) {
      console.error("error deleting report:", error);
      return response.render("error-view", {
        title: "delete error",
        message: error.message,
      });
    }
  },

  // auto generate reading goes to forecast page
  async autoGenerateReport(request, response) {
    const stationId = request.params.id;
    return response.redirect(`/station/${stationId}/forecast`); 
  },
};