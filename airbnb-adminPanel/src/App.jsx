import React, { lazy, Suspense, useState } from "react";
import { ToastNotification } from "./components/toast/toast";
import Loader from "./components/loader/loader";
import { SearchProvider } from "./context/context";

const Router = lazy(() => import("./config/router/router"));

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Suspense fallback={<Loader open={loading} />}>
        <SearchProvider>
          <ToastNotification />
          <Router />
        </SearchProvider>
      </Suspense>
    </>
  );
};

export default App;
