import type { Vehicle } from "../types/vehicle";
import type { Service } from "../types/service";

import {
  durableGetItem,
  durableRemoveItem,
  durableSetItem,
} from "./durableStorage";

export const VEHICLES_KEY = "xtrail_vehicles";

const SERVICES_KEY = "xtrail_services";
const ACTIVE_VEHICLE_KEY = "xtrail_active_vehicle_id";

function parseVehicles(raw: string): Vehicle[] {
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Stored vehicle data is not valid.");
  }

  return parsed as Vehicle[];
}

/**
 * Keep only a lightweight fallback in localStorage.
 *
 * Full vehicle data, including images, lives in IndexedDB.
 * This prevents large base64 images from filling localStorage.
 */
function createVehicleLocalStorageMirror(
  vehicles: Vehicle[]
): Vehicle[] {
  return vehicles.map((vehicle) => ({
    ...vehicle,
    image: "",
    bannerImage: "",
  }));
}

function saveVehicleLocalStorageMirror(
  vehicles: Vehicle[]
): void {
  try {
    localStorage.setItem(
      VEHICLES_KEY,
      JSON.stringify(
        createVehicleLocalStorageMirror(vehicles)
      )
    );
  } catch (error) {
    console.warn(
      "Could not update lightweight vehicle localStorage mirror:",
      error
    );
  }
}

/**
 * Synchronous fallback for the first render.
 *
 * The authoritative/full vehicle data is loaded afterwards
 * from IndexedDB using loadVehiclesDurable().
 */
export function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(VEHICLES_KEY);

    if (!raw) {
      return [];
    }

    return parseVehicles(raw);
  } catch (error) {
    console.error(
      "Failed to load local vehicle fallback:",
      error
    );

    return [];
  }
}

/**
 * Primary permanent vehicle loader.
 *
 * 1. Try IndexedDB first.
 * 2. If no IndexedDB data exists yet, migrate the existing
 *    localStorage vehicle data automatically.
 */
export async function loadVehiclesDurable(): Promise<
  Vehicle[]
> {
  try {
    const durableRaw = await durableGetItem(VEHICLES_KEY);

    if (durableRaw) {
      return parseVehicles(durableRaw);
    }

    const legacyRaw = localStorage.getItem(VEHICLES_KEY);

    if (!legacyRaw) {
      return [];
    }

    const legacyVehicles = parseVehicles(legacyRaw);

    // Migrate the old complete vehicle data to IndexedDB first.
    await durableSetItem(
      VEHICLES_KEY,
      JSON.stringify(legacyVehicles)
    );

    // Only after successful migration do we reduce the
    // localStorage copy.
    saveVehicleLocalStorageMirror(legacyVehicles);

    return legacyVehicles;
  } catch (error) {
    console.error(
      "Failed to load durable vehicle data:",
      error
    );

    return loadVehicles();
  }
}

/**
 * Authoritative vehicle save.
 *
 * Full data is written to IndexedDB FIRST.
 * localStorage only receives the lightweight mirror.
 */
export async function saveVehiclesDurable(
  vehicles: Vehicle[]
): Promise<void> {
  const raw = JSON.stringify(vehicles);

  await durableSetItem(VEHICLES_KEY, raw);

  saveVehicleLocalStorageMirror(vehicles);
}

/**
 * Kept for compatibility with any older code that still
 * imports saveVehicles().
 *
 * Do not use this as the authoritative save mechanism.
 */
export function saveVehicles(
  vehicles: Vehicle[]
): void {
  saveVehicleLocalStorageMirror(vehicles);
}

/**
 * Data Transfer must export the authoritative IndexedDB
 * value rather than the lightweight localStorage mirror.
 */
export async function getVehiclesExportValue(): Promise<string> {
  const durableRaw = await durableGetItem(VEHICLES_KEY);

  if (durableRaw) {
    return durableRaw;
  }

  const localRaw = localStorage.getItem(VEHICLES_KEY);

  if (localRaw) {
    return localRaw;
  }

  return "[]";
}

/**
 * Used during Data Transfer import.
 */
export async function replaceVehiclesFromExport(
  raw: string
): Promise<void> {
  const vehicles = parseVehicles(raw);

  await durableSetItem(
    VEHICLES_KEY,
    JSON.stringify(vehicles)
  );

  saveVehicleLocalStorageMirror(vehicles);
}

export async function clearDurableVehicles(): Promise<void> {
  await durableRemoveItem(VEHICLES_KEY);

  try {
    localStorage.removeItem(VEHICLES_KEY);
  } catch (error) {
    console.warn(
      "Could not clear local vehicle mirror:",
      error
    );
  }
}

export function loadActiveVehicleId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_VEHICLE_KEY);
  } catch (error) {
    console.error(
      "Failed to load active vehicle ID:",
      error
    );

    return null;
  }
}

export function saveActiveVehicleId(
  vehicleId: string | null
): void {
  try {
    if (!vehicleId) {
      localStorage.removeItem(ACTIVE_VEHICLE_KEY);
      return;
    }

    localStorage.setItem(
      ACTIVE_VEHICLE_KEY,
      vehicleId
    );
  } catch (error) {
    console.error(
      "Failed to save active vehicle ID:",
      error
    );
  }
}

export function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as Service[];
  } catch (error) {
    console.error(
      "Failed to load services:",
      error
    );

    return [];
  }
}

export function saveServices(
  services: Service[]
): void {
  try {
    localStorage.setItem(
      SERVICES_KEY,
      JSON.stringify(services)
    );
  } catch (error) {
    console.error(
      "Failed to save services:",
      error
    );
  }
}