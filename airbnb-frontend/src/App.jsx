import React, { lazy, Suspense, useEffect } from "react";
import Loader from "./components/loader/loader";

const Router = lazy(() => import("./config/router/router"));
import { Toaster } from "react-hot-toast";
import { ToastNotification } from "./components/toast/toast";

import { NotificationProvider } from "./context/NotificationContext";
import { useTheme } from "./context/ThemeContext.jsx";
import { useAppContext } from "./context/context.jsx";
import { getPlatformSettings } from "./services/platformSettingsService.js";
import { useTranslation } from "react-i18next";

const App = () => {
  const { toggleTheme } = useTheme();
  const { setLanguage } = useAppContext();
  const { i18n } = useTranslation();

  useEffect(() => {
    const initSettings = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const settings = await getPlatformSettings(token);
          if (settings) {
            // Sync App Mode
            if (settings.appMode) {
              toggleTheme(settings.appMode, false); // false = do not persist back
            }

            // Sync Language
            if (settings.language) {
              // Assuming logic to map code to full object if needed, or just code
              // The context uses { code, lang }. We only have code from backend.
              // We can try to match it with supported languages or just set code.

              const supportedLanguages = [
                { code: "en", lang: "English" },
                { code: "zh", lang: "Chinese" },
                { code: "tr", lang: "Turkish" },
                { code: "ar", lang: "Arabic" },
                { code: "ur", lang: "Urdu" },
                { code: "fr", lang: "French" },
                { code: "de", lang: "German" },
              ];
              const matchedLang = supportedLanguages.find(l => l.code === settings.language);

              if (matchedLang) {
                setLanguage(matchedLang);
                i18n.changeLanguage(settings.language);
              }
            }
          }
        } catch (error) {
          console.error("Failed to load platform settings", error);
        }
      }
    };

    initSettings();
  }, []);

  return (
    <Suspense fallback={<Loader open={true} />}>
      <ToastNotification />
      <Toaster position="top-right" reverseOrder={false} />
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </Suspense>
  )
};
export default App
