import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Vehicle, VehicleSetupProfile } from "../types/vehicle";
import {
  loadActiveVehicleId,
  loadVehicles,
  saveActiveVehicleId,
  saveVehicles,
} from "../lib/storage";

interface CreateVehicleInput {
  name: string;
  type: Vehicle["type"];
  brand: string;
  model: string;
  year: number;
  hours?: number;
  hoursAtPurchase?: number;
  manualAddedHours?: number;
  mileage?: number;
  notes?: string;
  image?: string;
  bannerImage?: string;
  setupProfile?: VehicleSetupProfile;
}

interface UpdateVehicleInput {
  name?: string;
  type?: Vehicle["type"];
  brand?: string;
  model?: string;
  year?: number;
  hours?: number;
  hoursAtPurchase?: number;
  manualAddedHours?: number;
  mileage?: number;
  notes?: string;
  image?: string;
  bannerImage?: string;
  setupProfile?: VehicleSetupProfile;
}

interface VehicleContextValue {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  activeVehicle: Vehicle | null;
  addVehicle: (input: CreateVehicleInput) => void;
  updateVehicle: (id: string, updates: UpdateVehicleInput) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicleId: (id: string) => void;
}

const VehicleContext = createContext<VehicleContextValue | undefined>(undefined);

function createVehicle(input: CreateVehicleInput): Vehicle {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    brand: input.brand,
    model: input.model,
    year: input.year,
    hours: input.hoursAtPurchase ?? input.hours ?? 0,
    hoursAtPurchase: input.hoursAtPurchase ?? input.hours ?? 0,
    manualAddedHours: input.manualAddedHours ?? 0,
    mileage: input.mileage ?? 0,
    notes: input.notes ?? "",
    image: input.image ?? "",
    bannerImage: input.bannerImage ?? "",
    setupProfile: input.setupProfile ?? {},
    createdAt: now,
    updatedAt: now,
  };
}

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(null);

  useEffect(() => {
    const storedVehicles = loadVehicles();
    const storedActiveVehicleId = loadActiveVehicleId();

    setVehicles(storedVehicles);

    if (
      storedActiveVehicleId &&
      storedVehicles.some((vehicle) => vehicle.id === storedActiveVehicleId)
    ) {
      setActiveVehicleIdState(storedActiveVehicleId);
    } else if (storedVehicles.length > 0) {
      setActiveVehicleIdState(storedVehicles[0].id);
    }
  }, []);

  useEffect(() => {
    saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveActiveVehicleId(activeVehicleId);
  }, [activeVehicleId]);

  const activeVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? null,
    [vehicles, activeVehicleId]
  );

  const addVehicle = (input: CreateVehicleInput) => {
    const newVehicle = createVehicle(input);

    setVehicles((prev) => [...prev, newVehicle]);
    setActiveVehicleIdState(newVehicle.id);
  };

  const updateVehicle = (id: string, updates: UpdateVehicleInput) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id
          ? { ...vehicle, ...updates, updatedAt: new Date().toISOString() }
          : vehicle
      )
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => {
      const next = prev.filter((vehicle) => vehicle.id !== id);

      if (activeVehicleId === id) {
        setActiveVehicleIdState(next.length > 0 ? next[0].id : null);
      }

      return next;
    });
  };

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicleId,
        activeVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setActiveVehicleId,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) throw new Error("useVehicles must be used inside VehicleProvider");
  return context;
}