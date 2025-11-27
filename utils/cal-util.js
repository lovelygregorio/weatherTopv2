import { Low } from "lowdb";           // lowdb class for creating db
import { JSONFile } from "lowdb/node"; // json adapter for reading/writing json file
import * as fs from "fs";              // fs checks or creates folders/files

// initstore creates a json file store inside ./models folder
export function initStore(dataType) {
  // if models folder doesn't exist, create it
  if (!fs.existsSync("./models")) {
    fs.mkdirSync("./models");
  }

  // default json structure: file path + empty list
  const store = {
    file: `./models/${dataType}.json`, // json file save path
    [dataType]: [],                    // empty array for storing data
  };

  // connect lowdb to json file
  const adapter = new JSONFile(store.file);
  const db = new Low(adapter);

  // if json file missing, make one with default data
  if (!fs.existsSync(store.file)) {
    fs.writeFileSync(store.file, JSON.stringify(store, null, 2));
  }

  return db; // return db instance to controllers
}

// copy and sort list to get newest weather report
export function latestReport(reports) {
  const list = [...(reports || [])]; 
  list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // newest first
  return list[0] || null; // return newest or null if empty
}

// get a min/max range for report numbers
function getMinMax(reports, key) {
  const values = (reports || [])
    .map((r) => Number(r[key])) // convert value to number
    .filter((v) => !Number.isNaN(v)); // remove invalid numbers
  if (values.length === 0) return { min: null, max: null }; // no valid numbers
  return { min: Math.min(...values), max: Math.max(...values) }; // return range
}

// stationsummary returns latest, temp, wind, pressure summary
export function stationSummary(reports) {
  const latest = latestReport(reports); // call newest report
  return {
    latest,                              // newest full report
    temperature: getMinMax(reports, "temp"),       // temp range
    windSpeed: getMinMax(reports, "windSpeed"),    // wind range
    pressure: getMinMax(reports, "pressure"),      // pressure range
  };
}
