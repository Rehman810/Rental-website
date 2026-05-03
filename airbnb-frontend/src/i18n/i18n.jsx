import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English
import enCommon from "../../public/locales/en/common.json";
import enHomepage from "../../public/locales/en/homepage.json";
import enListing from "../../public/locales/en/listing.json";
import enBooking from "../../public/locales/en/booking.json";
import enNavbar from "../../public/locales/en/navbar.json";
import enFooter from "../../public/locales/en/footer.json";
import enTranslation from "../../public/locales/en/translation.json";
import enLanguages from "../../public/locales/en/languages.json";
import enListings from "../../public/locales/en/listings.json";
import enProfile from "../../public/locales/en/profile.json";
import enLogin from "../../public/locales/en/login.json";
import enListingSteps from "../../public/locales/en/listingSteps.json";

// Urdu
import urCommon from "../../public/locales/ur/common.json";
import urHomepage from "../../public/locales/ur/homepage.json";
import urListing from "../../public/locales/ur/listing.json";
import urBooking from "../../public/locales/ur/booking.json";
import urNavbar from "../../public/locales/ur/navbar.json";
import urFooter from "../../public/locales/ur/footer.json";
import urTranslation from "../../public/locales/ur/translation.json";
import urLanguages from "../../public/locales/ur/languages.json";
import urListings from "../../public/locales/ur/listings.json";
import urProfile from "../../public/locales/ur/profile.json";
import urLogin from "../../public/locales/ur/login.json";
import urListingSteps from "../../public/locales/ur/listingSteps.json";

// Arabic
import arCommon from "../../public/locales/ar/common.json";
import arHomepage from "../../public/locales/ar/homepage.json";
import arListing from "../../public/locales/ar/listing.json";
import arBooking from "../../public/locales/ar/booking.json";
import arNavbar from "../../public/locales/ar/navbar.json";
import arFooter from "../../public/locales/ar/footer.json";
import arTranslation from "../../public/locales/ar/translation.json";
import arLanguages from "../../public/locales/ar/languages.json";
import arListings from "../../public/locales/ar/listings.json";
import arProfile from "../../public/locales/ar/profile.json";
import arLogin from "../../public/locales/ar/login.json";
import arListingSteps from "../../public/locales/ar/listingSteps.json";

// German
import deCommon from "../../public/locales/de/common.json";
import deHomepage from "../../public/locales/de/homepage.json";
import deListing from "../../public/locales/de/listing.json";
import deBooking from "../../public/locales/de/booking.json";
import deNavbar from "../../public/locales/de/navbar.json";
import deFooter from "../../public/locales/de/footer.json";
import deTranslation from "../../public/locales/de/translation.json";
import deLanguages from "../../public/locales/de/languages.json";

// French
import frCommon from "../../public/locales/fr/common.json";
import frHomepage from "../../public/locales/fr/homepage.json";
import frListing from "../../public/locales/fr/listing.json";
import frBooking from "../../public/locales/fr/booking.json";
import frNavbar from "../../public/locales/fr/navbar.json";
import frFooter from "../../public/locales/fr/footer.json";
import frTranslation from "../../public/locales/fr/translation.json";
import frLanguages from "../../public/locales/fr/languages.json";

// Turkish
import trCommon from "../../public/locales/tr/common.json";
import trHomepage from "../../public/locales/tr/homepage.json";
import trListing from "../../public/locales/tr/listing.json";
import trBooking from "../../public/locales/tr/booking.json";
import trNavbar from "../../public/locales/tr/navbar.json";
import trFooter from "../../public/locales/tr/footer.json";
import trTranslation from "../../public/locales/tr/translation.json";
import trLanguages from "../../public/locales/tr/languages.json";

// Chinese
import zhCommon from "../../public/locales/zh/common.json";
import zhHomepage from "../../public/locales/zh/homepage.json";
import zhListing from "../../public/locales/zh/listing.json";
import zhBooking from "../../public/locales/zh/booking.json";
import zhNavbar from "../../public/locales/zh/navbar.json";
import zhFooter from "../../public/locales/zh/footer.json";
import zhTranslation from "../../public/locales/zh/translation.json";
import zhLanguages from "../../public/locales/zh/languages.json";

const resources = {
  en: { common: enCommon, homepage: enHomepage, listing: enListing, booking: enBooking, navbar: enNavbar, footer: enFooter, translation: enTranslation, languages: enLanguages, listings: enListings, profile: enProfile, login: enLogin, listingSteps: enListingSteps },
  ur: { common: urCommon, homepage: urHomepage, listing: urListing, booking: urBooking, navbar: urNavbar, footer: urFooter, translation: urTranslation, languages: urLanguages, listings: urListings, profile: urProfile, login: urLogin, listingSteps: urListingSteps },
  ar: { common: arCommon, homepage: arHomepage, listing: arListing, booking: arBooking, navbar: arNavbar, footer: arFooter, translation: arTranslation, languages: arLanguages, listings: arListings, profile: arProfile, login: arLogin, listingSteps: arListingSteps },
  de: { common: deCommon, homepage: deHomepage, listing: deListing, booking: deBooking, navbar: deNavbar, footer: deFooter, translation: deTranslation, languages: deLanguages },
  fr: { common: frCommon, homepage: frHomepage, listing: frListing, booking: frBooking, navbar: frNavbar, footer: frFooter, translation: frTranslation, languages: frLanguages },
  tr: { common: trCommon, homepage: trHomepage, listing: trListing, booking: trBooking, navbar: trNavbar, footer: trFooter, translation: trTranslation, languages: trLanguages },
  zh: { common: zhCommon, homepage: zhHomepage, listing: zhListing, booking: zhBooking, navbar: zhNavbar, footer: zhFooter, translation: zhTranslation, languages: zhLanguages },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    supportedLngs: ["en", "ur", "ar", "de", "fr", "tr", "zh"],
    ns: ["common", "homepage", "listing", "booking", "translation", "footer", "navbar", "languages", "listings", "profile", "login", "listingSteps"],
    defaultNS: "common",
    resources,
    interpolation: {
      escapeValue: false, 
      defaultVariables: {
        appName: "Mehman" 
      }
    },
    keySeparator: ".",
    nsSeparator: ":",
  });

i18n.on("languageChanged", (lng) => {
  if (lng === "ur" || lng === "ar") {
    document.body.classList.add("ur-font");
  } else {
    document.body.classList.remove("ur-font");
  }
});

export default i18n;
