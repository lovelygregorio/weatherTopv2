// builds forecast page and saves a new reading for the station
import "dotenv/config";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { stationStore } from "../models/station-store.js";

const API_KEY = process.env.OPENWEATHER_KEY;

// openweather api urls
const GEO_URL = "http://api.openweathermap.org/geo/1.0/direct";
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// convert wind from m/s to km/h
function toKmH(mps) {
  return Math.round(mps * 3.6);
}

//simple text label for weather code
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

// change wind degrees into compass word (n, ne, e etc)
function windDirLabel(deg) {
  const d = ((Number(deg) % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  const index = Math.round(d / 45);
  return dirs[index];
}

// build max and min summary numbers for cards
function buildSummary(readings) {
  if (!readings || readings.length === 0) {
    return {
      temp: { max: "—", min: "—" },
      wind: { max: "—", min: "—" },
      pressure: { max: "—", min: "—" },
    };
  }

  const temps = [];
  const winds = [];
  const pressures = [];

  // loop through all readings and collect valid numbers
  for (let i = 0; i < readings.length; i++) {
    const r = readings[i];

    const t = Number(r.tempC);  // temperature in °C
    if (!Number.isNaN(t)) temps.push(t);

    const w = Number(r.windSpeed); // wind speed
    if (!Number.isNaN(w)) winds.push(w);

    const p = Number(r.pressure); // pressure
    if (!Number.isNaN(p)) pressures.push(p);
  }

  // if arrays have values, calculate min/max
  // otherwise use "—" so the UI does not break
  const tempMax = temps.length ? Math.max(...temps).toFixed(1) : "—";
  const tempMin = temps.length ? Math.min(...temps).toFixed(1) : "—";
  const windMax = winds.length ? Math.max(...winds).toFixed(1) : "—";
  const windMin = winds.length ? Math.min(...winds).toFixed(1) : "—";
  const pressMax = pressures.length ? Math.max(...pressures) : "—";
  const pressMin = pressures.length ? Math.min(...pressures) : "—";

  return { // return a simple summary object for the view
    temp: { max: tempMax, min: tempMin },
    wind: { max: windMax, min: windMin },
    pressure: { max: pressMax, min: pressMin },
  };
}

export const forecastController = {
  //  GET /station/:id/forecast
  async forecast(request, response) {
    try {
      // check api key
      if (!API_KEY) {
        return response.render("error-view", {
          title: "forecast error",
          message: "missing openweather api key",
        });
      }

      const stationId = request.params.id;
      const station = await stationStore.findById(stationId);

      if (!station) {
        return response.render("error-view", {
          title: "station error",
          message: "station not found",
        });
      }

      // get coordinates; If station has no lat/lng yet, use Geo API to look it up by name
      if (!station.lat || !station.lng) {
        const geoRes = await axios.get(GEO_URL, {
          params: {
            q: station.name,   // example: "dublin"
            limit: 1,
            appid: API_KEY,
          },
        });

        const places = geoRes.data;

        // if Geo API cannot find coordinates, show error page
        if (!places || places.length === 0) {
          return response.render("error-view", {
            title: "location error",
            message: "cannot find coordinates for this station name",
          });
        }

        // save coordinates back into station
        station.lat = places[0].lat;
        station.lng = places[0].lon;
      }

      const lat = station.lat;
      const lon = station.lng;

      // call OpenWeather current weather endpoint
      const currentRes = await axios.get(CURRENT_URL, {
        params: {
          lat: lat,
          lon: lon,
          units: "metric",
          appid: API_KEY,
        },
      });

      const c = currentRes.data;
      const w = c.weather && c.weather[0] ? c.weather[0] : {};

      // build full icon URL if icon code exists
      const iconUrl = w.icon
        ? "https://openweathermap.org/img/wn/" + w.icon + "@2x.png"
        : null;

      const current = { // format current weather for the view
        temp: Math.round(c.main.temp),
        feels: Math.round(c.main.feels_like),
        desc: (w.description || "—").toUpperCase(),
        iconUrl: iconUrl,
        wind: toKmH(c.wind.speed),
        windDeg: c.wind.deg,
        pressure: c.main.pressure,
        humidity: c.main.humidity,
      };

      // save reading into station for dashboard
      if (!station.readings) station.readings = [];

      station.readings.push({
        _id: uuid(),  // unique id for reading
        code: w.id,   // numeric weather code
        label: labelFor(w.id), // human-readable label
        icon: iconUrl,
        tempC: c.main.temp,
        windSpeed: current.wind,
        windDirection: current.windDeg,
        windDirLabel: windDirLabel(current.windDeg),
        pressure: current.pressure,
        humidity: current.humidity,
        time: new Date().toISOString(), // timestamp
        description: w.description || "",
      });
      
      // build min/max summary from all readings
      const summary = buildSummary(station.readings);

      //forecast list 
      const forecastRes = await axios.get(FORECAST_URL, {
        params: {
          lat: lat,
          lon: lon,
          units: "metric",
          appid: API_KEY,
        },
      });

      const list = forecastRes.data.list || [];

      // -------- build hourly array for next 48 hours 16x3h --------
      const hourly = [];
      const maxHourly = 16; // 16 x 3 hours = 48 hours

      for (let i = 0; i < maxHourly && i < list.length; i++) {
        const item = list[i];
        const fw = item.weather && item.weather[0] ? item.weather[0] : {};

        hourly.push({
          time: item.dt_txt,
          temp: item.main.temp,
          feels: item.main.feels_like,
          desc: (fw.description || "—").toUpperCase(),
          pop: Math.round((item.pop || 0) * 100),
          iconUrl: fw.icon
            ? "https://openweathermap.org/img/wn/" + fw.icon + "@2x.png"
            : null,
        });
      }

      // -------- build simple daily (5 days) --------
      const daily = [];
      // step by 8 because 8 x 3 hours = 24 hours
      for (let i = 0; i < list.length && daily.length < 5; i = i + 8) {
        const item = list[i];
        const fw = item.weather && item.weather[0] ? item.weather[0] : {};

        daily.push({
          date: item.dt_txt,
          tmax: item.main.temp_max,
          tmin: item.main.temp_min,
          pop: Math.round((item.pop || 0) * 100),
          desc: (fw.description || "—").toUpperCase(),
          iconUrl: fw.icon
            ? "https://openweathermap.org/img/wn/" + fw.icon + "@2x.png"
            : null,
        });
      }

      // convert arrays to JSON strings for use in Chart.js on the client side
      const hourlyJson = JSON.stringify(hourly);
      const dailyJson = JSON.stringify(daily);

      //Render forecast page and pass all data to the view
      return response.render("forecast-view", {
        title: station.name + " forecast",
        station: station,
        current: current,
        lat: lat,
        lon: lon,
        summary: summary,
        hourlyJson: hourlyJson,
        dailyJson: dailyJson,
      });
    } catch (error) {
      console.error("forecast error:", error.message);

       // show generic error page if any step above fails
      return response.render("error-view", {
        title: "forecast error",
        message: "could not load forecast data",
      });
    }
  },
};
