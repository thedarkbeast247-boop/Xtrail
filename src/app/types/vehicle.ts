export type VehicleType =
  | "dirt-bike"
  | "adventure-bike"
  | "quad"
  | "sxs"
  | "4x4"
  | "other";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  hours: number;
  mileage: number;
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}