import { createRoot } from "react-dom/client";
import App from "./app/App";
import { VehicleProvider } from "./app/context/VehicleContext";
import { ServiceProvider } from "./app/context/ServiceContext";
import { UserAccessProvider } from "./app/context/UserAccessContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <UserAccessProvider>
    <VehicleProvider>
      <ServiceProvider>
        <App />
      </ServiceProvider>
    </VehicleProvider>
  </UserAccessProvider>
);