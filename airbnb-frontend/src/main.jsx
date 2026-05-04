import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "./context/context.jsx";
import { WishlistProvider } from "./context/wishlistProvider.jsx";
import { BookingProvider } from "./context/booking.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n/i18n.jsx";

// ─── TanStack Query client with sensible defaults ────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <WishlistProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </WishlistProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
