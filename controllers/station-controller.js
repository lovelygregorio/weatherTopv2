// handles create, view and delete for stations and also talks to openweather api to auto-add a first reading
import "dotenv/config";     // load env vars like api key
import axios from "axios";  // for api calls
import { v4 as uuid } from "uuid";  // unique ids for readings
import { stationStore } from "../models/station-store.js"; // station data store


const API_KEY = process.env.OPENWEATHER_KEY; // openweather api key from .env

// OpenWeather endpoints
const GEO_URL = "http://api.openweathermap.org/geo/1.0/direct";
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";

// --------------- helper functions ---------------

// convert m/s from API to km/h for display
function toKmH(mps) {
  return Math.round(mps * 3.6);
}

// simple label for weather code
function labelFor(code) {
  const c = Number(code);
  if (c === 800) return "Clear";
  if (c >= 801 && c <= 804) return "Clouds";
  if (c >= 500 && c <= 531) return "Rain";
  if (c >= 200 && c <= 232) return "Thunderstorm";
  if (c >= 600 && c <= 622) return "Snow";
  if (c >= 701 && c <= 781) return "Fog / Mist";
  return "Weather";
}

// map wind degrees to compass direction (N, NE, E, SE, S, SW, W, NW)
function windDirLabel(deg) {
  const d = ((Number(deg) % 360) + 360) % 360; // normalise 0–359
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  const i = Math.round(d / 45);
  return dirs[i];
}

// build summary stats (max/min) from readings array
function buildSummary(readings) {
  if (!readings || readings.length === 0) return null;

  const temps = readings
    .map((r) => Number(r.tempC))
    .filter((v) => !Number.isNaN(v));
  const winds = readings
    .map((r) => Number(r.windSpeed))
    .filter((v) => !Number.isNaN(v));
  const pressures = readings
    .map((r) => Number(r.pressure))
    .filter((v) => !Number.isNaN(v));

  const tempMax = temps.length ? Math.max(...temps) : null;
  const tempMin = temps.length ? Math.min(...temps) : null;
  const windMax = winds.length ? Math.max(...winds) : null;
  const windMin = winds.length ? Math.min(...winds) : null;
  const pressMax = pressures.length ? Math.max(...pressures) : null;
  const pressMin = pressures.length ? Math.min(...pressures) : null;

  return {
    temp: {
      max: tempMax !== null ? tempMax.toFixed(1) : "—",
      min: tempMin !== null ? tempMin.toFixed(1) : "—",
    },
    wind: {
      max: windMax !== null ? windMax.toFixed(1) : "—",
      min: windMin !== null ? windMin.toFixed(1) : "—",
    },
    pressure: {
      max: pressMax !== null ? pressMax : "—",
      min: pressMin !== null ? pressMin : "—",
    },
  };
}

export const stationController = {
  // GET /station/:id  — station detail page
  async index(request, response) {
    const stationId = request.params.id;
    const station = await stationStore.findById(stationId);

    if (!station) {
      return response.render("error-view", {
        title: "Error",
        message: "Station not found",
      });
    }

    // auto-generated readings from OpenWeather () used for the cards and summary)
    const readings = station.readings || [];

    // manual reports you add from the form (used for the reports table)
    const reports = station.reports || [];

    const last = readings[readings.length - 1];

    let latest = null;
    let summary = null;

    // latest card data based on last reading
    if (last) {
      latest = {
        icon: last.icon || "/images/default-weather.png",
        label: last.label || "",
        tempC: last.tempC,
        windSpeed: last.windSpeed,
        windDirLabel: last.windDirLabel || windDirLabel(last.windDirection),
        pressure: last.pressure,
        humidity: last.humidity,
      };
      summary = buildSummary(readings);
    }

    return response.render("station-view", {
      title: station.name,
      station,
      readings, // used by summary and cards
      reports,  // used by each reports in station-view.hbs
      latest,
      summary,
    });
  },

  // create a new station and auto-generate first api reading
  async createStation(request, response) {
    const user = request.session.user;

    // create basic station (lat and lng can be blank if name only)
    const station = await stationStore.create({
      userId: user?._id || "",
      name: request.body.name,
      lat: request.body.lat,
      lng: request.body.lng,
    });

    // try to get a first reading from openweather api
    try {
      if (API_KEY && station.name) {

        // if lat/lng missing, geocode by name
        if (!station.lat || !station.lng) {
          const geoRes = await axios.get(GEO_URL, {
            params: { q: station.name, limit: 1, appid: API_KEY },
          });

          const results = geoRes.data;
          if (results && results.length > 0) {
            station.lat = results[0].lat;
            station.lng = results[0].lon;
          }
        }

       // if coords present, call current weather api
        if (station.lat && station.lng) {
          const weatherRes = await axios.get(CURRENT_URL, {
            params: {
              lat: station.lat,
              lon: station.lng,
              units: "metric",
              appid: API_KEY,
            },
          });

          const d = weatherRes.data;
          const w = d.weather && d.weather[0] ? d.weather[0] : {};

          const iconUrl = w.icon
            ? `https://openweathermap.org/img/wn/${w.icon}@2x.png`
            : null;

           // build one reading object from api response
          const reading = {
            _id: uuid(),
            code: w.id,
            label: labelFor(w.id),
            icon: iconUrl,
            tempC: d.main.temp,
            windSpeed: toKmH(d.wind.speed),
            windDirection: d.wind.deg,
            windDirLabel: windDirLabel(d.wind.deg),
            pressure: d.main.pressure,
            humidity: d.main.humidity,
            time: new Date().toISOString(),
            description: w.description || "",
          };

          if (!station.readings) station.readings = [];
          station.readings.push(reading);
        }
      }
    } catch (err) {
      console.error("Auto-generate on create failed:", err.message);
      // do not stop user if api fails, station still created
    }

    // go back to dashboard after creating station
    return response.redirect("/dashboard");
  },

  // delete station by id from dashboard
  async deleteStation(request, response) {
    await stationStore.delete(request.params.id);
    return response.redirect("/dashboard");
  },
};
