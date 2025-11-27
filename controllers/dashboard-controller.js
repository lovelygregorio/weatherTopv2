import { stationStore } from "../models/station-store.js";
//dashboard controller: gets all stations and latest weather reading
//sorts cities by name and sends simple data to dashboard view

// convert wind degree number into compass word
function windDirLabel(deg) {
  let d = Number(deg);
  if (!Number.isFinite(d)) return "";
  d = ((d % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  const index = Math.round(d / 45);
  return dirs[index];
}

// simple beaufort scale from km per hour
function beaufort(kmh) {
  const s = Number(kmh);
  if (!Number.isFinite(s)) return "";
  if (s <= 1) return 0;
  if (s <= 5) return 1;
  if (s <= 11) return 2;
  if (s <= 19) return 3;
  if (s <= 28) return 4;
  if (s <= 38) return 5;
  if (s <= 49) return 6;
  if (s <= 61) return 7;
  if (s <= 74) return 8;
  if (s <= 88) return 9;
  if (s <= 102) return 10;
  if (s <= 117) return 11;
  return 12;
}

// build high and low values for temp, wind and pressure
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

  for (let i = 0; i < readings.length; i++) {
    const r = readings[i];
    const t = Number(r.tempC);
    const w = Number(r.windSpeed);
    const p = Number(r.pressure);

    // check if temp,wind and pressure are valid number before saving
    if (Number.isFinite(t)) temps.push(t);
    if (Number.isFinite(w)) winds.push(w);
    if (Number.isFinite(p)) pressures.push(p);
  }

  return { // return an object that stores the min and max values 
    temp: {
      max: temps.length ? Math.max(...temps).toFixed(1) : "—",
      min: temps.length ? Math.min(...temps).toFixed(1) : "—",
    },
    wind: {
      max: winds.length ? Math.max(...winds).toFixed(1) : "—",
      min: winds.length ? Math.min(...winds).toFixed(1) : "—",
    },
    pressure: {
      max: pressures.length ? Math.max(...pressures) : "—",
      min: pressures.length ? Math.min(...pressures) : "—",
    },
  };
}

export const dashboardController = {
  // show dashboard page
  async index(request, response) {
    const user = request.session.user;

    // get all stations
    const stations = await stationStore.getAllStations();

    // sort by name from a to z 
    stations.sort((a, b) => a.name.localeCompare(b.name));

    const viewStations = []; // empty array that will hold stations with their latest weather + summary

    // loop through all saved weather stations
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      const readings = station.readings || [];
      const last = readings[readings.length - 1];

      let latest = null; // will store formatted latest weather for UI
      let summary = null; // will store min/max stats for 24 hours

      if (last) { // only build latest weather if we actually have a reading
        
        // convert raw values to numbers so we can safely check if valid
        const tempC = Number(last.tempC); 
        const wind = Number(last.windSpeed);
        const press = Number(last.pressure);

        
        // prepare a clean formatted weather object for the dashboard view
        // we check for finite numbers to avoid NaN breaking the app
        latest = {
          icon: last.icon || "/images/default-weather.png",
          label: last.label || "",
          tempC: Number.isFinite(tempC) ? tempC.toFixed(1) : "",
          tempF: Number.isFinite(tempC)
            ? ((tempC * 9) / 5 + 32).toFixed(1)
            : "",
          windSpeed: Number.isFinite(wind) ? wind.toFixed(1) : "",
          windBft: Number.isFinite(wind) ? beaufort(wind) : "",
          windDirLabel:
            last.windDirLabel || windDirLabel(last.windDirection),
          pressure: Number.isFinite(press) ? press : "",
        };

        // build summary statistics (min/max for temp, wind, pressure)
        summary = buildSummary(readings);
      }

        // push original station info + latest weather + summary into viewStations list
      viewStations.push({
        ...station,
        latest,
        summary,
      });
    }

    // finally, render the dashboard page and pass the station list to UI
    // `firstname` is taken from session, defaulting to "Lovely" if missing
    return response.render("dashboard-view", {
      title: "WeatherTop Dashboard",
      firstname: user?.firstName || "Lovely",
      stations: viewStations,
    });
  },
};
