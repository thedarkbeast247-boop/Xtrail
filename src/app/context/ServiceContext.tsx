import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Service } from "../types/service";
import { loadServices, saveServices } from "../lib/storage";

interface CreateServiceInput {
  vehicleId: string;
  title: string;
  description?: string;
  date: string;
  hours?: number;
  mileage?: number;
}

interface UpdateServiceInput {
  title?: string;
  description?: string;
  date?: string;
  hours?: number;
  mileage?: number;
}

interface ServiceContextValue {
  services: Service[];
  addService: (input: CreateServiceInput) => void;
  updateService: (id: string, updates: UpdateServiceInput) => void;
  deleteService: (id: string) => void;
  getServicesForVehicle: (vehicleId: string) => Service[];
}

const ServiceContext = createContext<ServiceContextValue | undefined>(undefined);

function createService(input: CreateServiceInput): Service {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    vehicleId: input.vehicleId,
    title: input.title,
    description: input.description ?? "",
    date: input.date,
    hours: input.hours ?? 0,
    mileage: input.mileage ?? 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setServices(loadServices());
  }, []);

  useEffect(() => {
    saveServices(services);
  }, [services]);

  const addService = (input: CreateServiceInput) => {
    const newService = createService(input);
    setServices((prev) => [...prev, newService]);
  };

  const updateService = (id: string, updates: UpdateServiceInput) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id
          ? {
              ...service,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : service
      )
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  const getServicesForVehicle = (vehicleId: string) => {
    return services
      .filter((service) => service.vehicleId === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  };

  const value = useMemo(
    () => ({
      services,
      addService,
      updateService,
      deleteService,
      getServicesForVehicle,
    }),
    [services]
  );

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error("useServices must be used inside ServiceProvider");
  }

  return context;
}