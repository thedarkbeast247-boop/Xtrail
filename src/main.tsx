import { createRoot } from "react-dom/client";
import App from "./app/App";

import { VehicleProvider } from "./app/context/VehicleContext";
import { ServiceProvider } from "./app/context/ServiceContext";
import { UserAccessProvider } from "./app/context/UserAccessContext";
import { RideRecordingProvider } from "./app/context/RideRecordingContext";

import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <UserAccessProvider>
    <VehicleProvider>
      <ServiceProvider>
        <RideRecordingProvider>
          <App />
        </RideRecordingProvider>
      </ServiceProvider>
    </VehicleProvider>
  </UserAccessProvider>
);