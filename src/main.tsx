import { createRoot } from "react-dom/client";
import App from "./app/App";
import { VehicleProvider } from "./app/context/VehicleContext";
import { ServiceProvider } from "./app/context/ServiceContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <VehicleProvider>
    <ServiceProvider>
      <App />
    </ServiceProvider>
  </VehicleProvider>
);