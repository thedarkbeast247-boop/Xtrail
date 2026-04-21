import type { Vehicle } from "../types/vehicle";
import type { Service } from "../types/service";

const VEHICLES_KEY = "xtrail_vehicles";
const SERVICES_KEY = "xtrail_services";
const ACTIVE_VEHICLE_KEY = "xtrail_active_vehicle_id";

export function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(VEHICLES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Vehicle[];
  } catch (error) {
    console.error("Failed to load vehicles:", error);
    return [];
  }
}

export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error("Failed to save vehicles:", error);
  }
}

export function loadActiveVehicleId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_VEHICLE_KEY);
  } catch (error) {
    console.error("Failed to load active vehicle ID:", error);
    return null;
  }
}

export function saveActiveVehicleId(vehicleId: string | null): void {
  try {
    if (!vehicleId) {
      localStorage.removeItem(ACTIVE_VEHICLE_KEY);
      return;
    }

    localStorage.setItem(ACTIVE_VEHICLE_KEY, vehicleId);
  } catch (error) {
    console.error("Failed to save active vehicle ID:", error);
  }
}

export function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Service[];
  } catch (error) {
    console.error("Failed to load services:", error);
    return [];
  }
}

export function saveServices(services: Service[]): void {
  try {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  } catch (error) {
    console.error("Failed to save services:", error);
  }
}