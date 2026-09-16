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
  loadVehiclesDurable,
  saveActiveVehicleId,
  saveVehiclesDurable,
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
  color?: string;
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
  color?: string;
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
    color: input.color ?? "#ef4444",
    setupProfile: input.setupProfile ?? {},
    createdAt: now,
    updatedAt: now,
  };
}

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    return loadVehicles();
  });

  const [vehiclesHydrated, setVehiclesHydrated] = useState(false);

  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(
    () => {
      const storedVehicles = loadVehicles();
      const storedActiveVehicleId = loadActiveVehicleId();

      if (
        storedActiveVehicleId &&
        storedVehicles.some(
          (vehicle) => vehicle.id === storedActiveVehicleId
        )
      ) {
        return storedActiveVehicleId;
      }

      return storedVehicles[0]?.id ?? null;
    }
  );

  useEffect(() => {
    let cancelled = false;

    const hydrateVehicles = async () => {
      try {
        const durableVehicles =
          await loadVehiclesDurable();

        if (cancelled) {
          return;
        }

        setVehicles(durableVehicles);

        const storedActiveVehicleId =
          loadActiveVehicleId();

        if (
          storedActiveVehicleId &&
          durableVehicles.some(
            (vehicle) =>
              vehicle.id === storedActiveVehicleId
          )
        ) {
          setActiveVehicleIdState(
            storedActiveVehicleId
          );
        } else {
          setActiveVehicleIdState(
            durableVehicles[0]?.id ?? null
          );
        }
      } catch (error) {
        console.error(
          "Failed to hydrate durable vehicles:",
          error
        );
      } finally {
        if (!cancelled) {
          setVehiclesHydrated(true);
        }
      }
    };

    void hydrateVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!vehiclesHydrated) {
      return;
    }

    const persistVehicles = async () => {
      try {
        await saveVehiclesDurable(vehicles);
      } catch (error) {
        console.error(
          "CRITICAL: Vehicle data could not be persisted:",
          error
        );
      }
    };

    void persistVehicles();
  }, [vehicles, vehiclesHydrated]);

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
    const vehicleExists = vehicles.some(
      (vehicle) => vehicle.id === id
    );

    if (!vehicleExists) {
      console.warn(
        `Cannot set active vehicle. Vehicle "${id}" does not exist.`
      );

      return;
    }

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