import { ChevronDown } from 'lucide-react';
import { VehicleProfile } from '../data/mockData';

interface VehicleSelectorProps {
  vehicles: VehicleProfile[];
  activeVehicle: VehicleProfile;
  onVehicleChange: (vehicle: VehicleProfile) => void;
}

export function VehicleSelector({ vehicles, activeVehicle, onVehicleChange }: VehicleSelectorProps) {
  return (
    <div className="relative">
      <select
        value={activeVehicle.id}
        onChange={(e) => {
          const vehicle = vehicles.find(v => v.id === e.target.value);
          if (vehicle) onVehicleChange(vehicle);
        }}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {vehicles.map(vehicle => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.name} ({vehicle.type})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
    </div>
  );
}
