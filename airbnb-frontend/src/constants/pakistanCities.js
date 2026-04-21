export const pakistanCities = [
  // Major Cities
  { name: "Karachi", cityKey: "karachi", province: "Sindh", type: "major", popular: true },
  { name: "Lahore", cityKey: "lahore", province: "Punjab", type: "major", popular: true },
  { name: "Islamabad", cityKey: "islamabad", province: "Islamabad Capital Territory", type: "major", popular: true },
  { name: "Rawalpindi", cityKey: "rawalpindi", province: "Punjab", type: "major", popular: false },
  { name: "Faisalabad", cityKey: "faisalabad", province: "Punjab", type: "major", popular: false },
  { name: "Multan", cityKey: "multan", province: "Punjab", type: "major", popular: false },
  { name: "Peshawar", cityKey: "peshawar", province: "Khyber Pakhtunkhwa", type: "major", popular: false },
  { name: "Quetta", cityKey: "quetta", province: "Balochistan", type: "major", popular: false },
  { name: "Sialkot", cityKey: "sialkot", province: "Punjab", type: "major", popular: false },
  { name: "Hyderabad", cityKey: "hyderabad", province: "Sindh", type: "major", popular: false },

  // Tourist Destinations
  { name: "Murree", cityKey: "murree", province: "Punjab", type: "tourist", popular: true },
  { name: "Hunza", cityKey: "hunza", province: "Gilgit-Baltistan", type: "tourist", popular: true },
  { name: "Skardu", cityKey: "skardu", province: "Gilgit-Baltistan", type: "tourist", popular: true },
  { name: "Swat", cityKey: "swat", province: "Khyber Pakhtunkhwa", type: "tourist", popular: true },
  { name: "Naran", cityKey: "naran", province: "Khyber Pakhtunkhwa", type: "tourist", popular: true },
  { name: "Kaghan", cityKey: "kaghan", province: "Khyber Pakhtunkhwa", type: "tourist", popular: false },
  { name: "Nathiagali", cityKey: "nathiagali", province: "Khyber Pakhtunkhwa", type: "tourist", popular: false },
  { name: "Gilgit", cityKey: "gilgit", province: "Gilgit-Baltistan", type: "tourist", popular: false },
  { name: "Chaman", cityKey: "chaman", province: "Balochistan", type: "tourist", popular: false },
  { name: "Gwadar", cityKey: "gwadar", province: "Balochistan", type: "tourist", popular: false },

  // Northern Areas / Hill Stations
  { name: "Fairy Meadows", cityKey: "fary_meadows", province: "Gilgit-Baltistan", type: "tourist", popular: false },
  { name: "Shogran", cityKey: "shogran", province: "Khyber Pakhtunkhwa", type: "tourist", popular: false },
  { name: "Kalash Valley", cityKey: "kalash_valley", province: "Khyber Pakhtunkhwa", type: "tourist", popular: false },
  { name: "Chitral", cityKey: "chitral", province: "Khyber Pakhtunkhwa", type: "tourist", popular: false },

  // Major Areas (Hierarchy)
  { name: "DHA Phase 6, Karachi", cityKey: "dha_6_karachi", province: "Sindh", type: "area", parentCity: "Karachi" },
  { name: "Clifton, Karachi", cityKey: "clifton_karachi", province: "Sindh", type: "area", parentCity: "Karachi" },
  { name: "Bahria Town, Lahore", cityKey: "bahria_lahore", province: "Punjab", type: "area", parentCity: "Lahore" },
  { name: "Gulberg, Lahore", cityKey: "gulberg_lahore", province: "Punjab", type: "area", parentCity: "Lahore" },
  { name: "F-7, Islamabad", cityKey: "f7_islamabad", province: "Islamabad Capital Territory", type: "area", parentCity: "Islamabad" },
  { name: "E-11, Islamabad", cityKey: "e11_islamabad", province: "Islamabad Capital Territory", type: "area", parentCity: "Islamabad" },
  { name: "Bahria Town, Islamabad", cityKey: "bahria_islamabad", province: "Islamabad Capital Territory", type: "area", parentCity: "Islamabad" },
];

export const normalizeCityName = (input) => {
  if (!input) return "";
  const name = input.trim().toLowerCase();
  
  const mapping = {
    "isb": "Islamabad",
    "isl": "Islamabad",
    "khi": "Karachi",
    "lhr": "Lahore",
    "pindi": "Rawalpindi",
    "rwp": "Rawalpindi",
    "pesh": "Peshawar",
    "hyd": "Hyderabad",
    "fsd": "Faisalabad",
  };

  if (mapping[name]) return mapping[name];

  const found = pakistanCities.find(c => c.name.toLowerCase() === name);
  if (found) return found.name;

  return input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const getCityName = (city, t) => {
  const key = `translation:cities.${city.cityKey}.name`;
  const translatedName = t(key);
  // If translatedName is same as key, or contains the key (depending on i18next config), return city.name
  if (!translatedName || translatedName === key || translatedName.includes(city.cityKey + ".name")) {
    return city.name;
  }
  return translatedName;
};

export const getCityText = (city, t) => {
  const key = `translation:cities.${city.cityKey}.text`;
  const translatedText = t(key);
  if (!translatedText || translatedText === key || translatedText.includes(city.cityKey + ".text")) {
    // Generic fallback descriptions
    if (city.type === 'tourist') return t("translation:popularTouristSpot", { defaultValue: "Popular tourist destination" });
    if (city.type === 'area') return t("translation:premiumArea", { defaultValue: "Premium residential neighborhood" });
    return t("translation:majorCitypk", { defaultValue: "Major city in Pakistan" });
  }
  return translatedText;
};
