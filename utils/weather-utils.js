// map api weather code to text label for ui
export function labelFor(code) {
  const c = Number(code);
  if (Number.isNaN(c)) return "unknown"; // if not a number, show unknown
  if (c >= 200 && c <= 232) return "thunderstorm";
  if (c >= 300 && c <= 321) return "drizzle";
  if (c >= 500 && c <= 531) return "rain";
  if (c >= 600 && c <= 622) return "snow";
  if (c >= 701 && c <= 781) return "atmosphere"; // fog/mist/haze
  if (c === 800) return "clear";
  if (c >= 801 && c <= 804) return "clouds";
  return "weather"; // default fallback
}

// icon helper (internal): weather code to default icon code
function iconCodeFor(code) {
  const c = Number(code);
  if (Number.isNaN(c)) return "02d"; // default icon
  if (c >= 200 && c <= 232) return "11d";
  if (c >= 300 && c <= 321) return "09d";
  if (c >= 500 && c <= 531) return "10d";
  if (c >= 600 && c <= 622) return "13d";
  if (c >= 701 && c <= 781) return "50d";
  if (c === 800) return "01d";
  if (c === 801) return "02d";
  if (c === 802) return "03d";
  if (c === 803 || c === 804) return "04d";
  return "02d"; // fallback icon
}

// convert weather code or direct icon string to full url for ui image
export function iconUrlFor(codeOrIcon) {
  if (typeof codeOrIcon === "string" && /^[0-9]{2}[dn]$/.test(codeOrIcon)) {
    return codeOrIcon; // icon code used directly
  }
  const ic = iconCodeFor(codeOrIcon);
  return ic; // derived icon for image
}

// convert wind speed in km/h to beaufort scale number
export function beaufort(kmh) {
  const s = Number(kmh);
  if (Number.isNaN(s)) return null; // invalid wind, no scale
  if (s <= 1) return 0;  // calm
  if (s <= 5) return 1;  // light air
  if (s <= 11) return 2; // light breeze
  if (s <= 19) return 3; // gentle breeze
  if (s <= 28) return 4; // moderate breeze
  if (s <= 38) return 5; // fresh breeze
  if (s <= 49) return 6; // strong breeze
  if (s <= 61) return 7; // near gale
  if (s <= 74) return 8; // gale
  if (s <= 88) return 9; // strong gale
  if (s <= 102) return 10; // storm
  if (s <= 117) return 11; // violent storm
  return 12; // hurricane
}

// convert wind degrees to compass direction label
export function directionLabel(deg) {
  const d = Number(deg);
  if (Number.isNaN(d)) return null; // invalid deg
  const dirs = ["n","nne","ne","ene","e","ese","se","sse","s","ssw","sw","wsw","w","wnw","nw","nnw"];
  const idx = Math.round((d % 360) / 22.5) % 16;
  return dirs[idx];
}
