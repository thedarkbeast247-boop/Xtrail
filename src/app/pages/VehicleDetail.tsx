import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useVehicles } from "../context/VehicleContext";

export function VehicleDetail() {
  const { vehicleId } = useParams();
  const { vehicles } = useVehicles();

  const vehicle = vehicles.find((v: any) => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="p-4 text-white">
        Vehicle not found
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4">
        <Link to="/garage">
          <button className="text-neutral-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>

        <div>
          <h1 className="text-lg font-semibold">{vehicle.name}</h1>
          <p className="text-sm text-neutral-400">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-4">
        {/* Basic Info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-sm text-neutral-400">Vehicle Info</h2>

          <div className="mt-3 space-y-2 text-sm">
            <p>Type: {vehicle.type}</p>
            <p>Year: {vehicle.year}</p>
            <p>Hours: {vehicle.hours}</p>
            <p>Mileage: {vehicle.mileage}</p>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-sm text-neutral-400">Notes</h2>
            <p className="mt-2 text-sm text-neutral-300">
              {vehicle.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}