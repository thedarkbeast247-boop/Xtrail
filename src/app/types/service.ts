export interface Service {
  id: string;
  vehicleId: string;

  title: string;
  description?: string;

  date: string;

  hours?: number;
  mileage?: number;

  createdAt: string;
  updatedAt: string;
}