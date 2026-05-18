import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Plus,
  Wrench,
  Calendar,
  Clock,
  Filter,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useVehicles } from "../context/VehicleContext";
import { useServices } from "../context/ServiceContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  getMaintenanceProfile,
  getTrackingModeLabel,
  getVehicleUsageUnit,
} from "../lib/maintenance";

const serviceTypes = [
  "Oil Change",
  "Oil Filter",
  "Air Filter",
  "Chain Maintenance",
  "Brake Pads",
  "Valve Clearance Check",
  "Spark Plug Inspection",
  "Suspension Service",
  "Coolant Flush",
  "Engine Oil Service",
  "Major Service",
  "Transfer Case Service",
  "Differential Oil Service",
  "Driveline Lubrication",
  "Shock Inspection",
  "Other",
];

export function ServiceLog() {
  const { vehicles, activeVehicle, setActiveVehicleId } = useVehicles();
  const { addService, getServicesForVehicle } = useServices();
  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicleId");
  const [hasAppliedUrlVehicleFilter, setHasAppliedUrlVehicleFilter] =
    useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    type: "",
    date: "",
    usageReading: "",
    notes: "",
  });

  useEffect(() => {
    if (!hasAppliedUrlVehicleFilter && vehicleIdFromUrl) {
      const urlVehicleExists = vehicles.some(
        (vehicle) => vehicle.id === vehicleIdFromUrl
      );

      if (urlVehicleExists) {
        setSelectedVehicleId(vehicleIdFromUrl);
        setHasAppliedUrlVehicleFilter(true);
        return;
      }
    }

    if (!selectedVehicleId && activeVehicle?.id) {
      setSelectedVehicleId(activeVehicle.id);
      return;
    }

    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [
    activeVehicle,
    vehicles,
    selectedVehicleId,
    vehicleIdFromUrl,
    hasAppliedUrlVehicleFilter,
  ]);

  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;

  const filteredServices = selectedVehicle
    ? getServicesForVehicle(selectedVehicle.id)
    : [];

  const trackingModeLabel = selectedVehicle
    ? getTrackingModeLabel(selectedVehicle.type)
    : "";

  const usageUnit = selectedVehicle
    ? getVehicleUsageUnit(selectedVehicle.type)
    : "hours";

  const usageFieldLabel =
    usageUnit === "hours" ? "Hours at Service" : "KM at Service";

  const maintenanceProfile = selectedVehicle
    ? getMaintenanceProfile(selectedVehicle.type)
    : null;

  const suggestedTasks = useMemo(() => {
    if (!maintenanceProfile) return serviceTypes;
    const taskLabels = maintenanceProfile.tasks.map((task) => task.label);
    return [...new Set([...taskLabels, ...serviceTypes])];
  }, [maintenanceProfile]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveVehicleId(vehicleId);
  };

  const handleAddService = () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle first.");
      return;
    }

    if (!newService.type || !newService.date) {
      alert("Please fill in service type and date.");
      return;
    }

    const numericReading = Number(newService.usageReading) || 0;

    addService({
      vehicleId: selectedVehicle.id,
      title: newService.type,
      description: newService.notes,
      date: newService.date,
      hours: usageUnit === "hours" ? numericReading : 0,
      mileage: usageUnit === "km" ? numericReading : 0,
    });

    setIsAddModalOpen(false);
    setNewService({
      type: "",
      date: "",
      usageReading: "",
      notes: "",
    });
  };

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl mb-1">Service Log</h1>
            <p className="text-neutral-400 text-sm">
              Track maintenance by vehicle
            </p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-600 hover:bg-red-700 gap-2"
                onClick={(e) => {
                  if (!selectedVehicle) {
                    e.preventDefault();
                    alert("Please create and select a vehicle first.");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Add Service Entry</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-neutral-300">Vehicle</Label>
                  <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white text-sm">
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                      : "No vehicle selected"}
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-300">Tracking Mode</Label>
                  <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white text-sm">
                    {trackingModeLabel || "N/A"}
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-300">Service Type</Label>
                  <Select
                    value={newService.type}
                    onValueChange={(val) =>
                      setNewService({ ...newService, type: val })
                    }
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {suggestedTasks.map((type) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-300">Date</Label>
                  <Input
                    type="date"
                    value={newService.date}
                    onChange={(e) =>
                      setNewService({ ...newService, date: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">{usageFieldLabel}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newService.usageReading}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        usageReading: e.target.value,
                      })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Notes</Label>
                  <Textarea
                    placeholder="Add any notes..."
                    value={newService.notes}
                    onChange={(e) =>
                      setNewService({ ...newService, notes: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1 min-h-20"
                  />
                </div>

                <Button
                  onClick={handleAddService}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Save Service Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {filteredServices.length}
            </div>
            <div className="text-neutral-400 text-xs">Services</div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {selectedVehicle ? trackingModeLabel : "-"}
            </div>
            <div className="text-neutral-400 text-xs">Tracking</div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {selectedVehicle
                ? `${usageUnit === "hours" ? selectedVehicle.hours.toFixed(0) : selectedVehicle.mileage.toFixed(0)}`
                : "0"}
            </div>
            <div className="text-neutral-400 text-xs">
              Current {usageUnit === "hours" ? "Hours" : "KM"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-300 text-sm">Choose Vehicle</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-lg p-6 text-center">
              <p className="text-neutral-400 mb-2">No vehicles in your garage yet</p>
              <p className="text-neutral-500 text-sm">
                Add a vehicle first to start logging service history.
              </p>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;

                return (
                  <Button
                    key={vehicle.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectVehicle(vehicle.id)}
                    className={`flex-shrink-0 gap-2 ${
                      isSelected
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                    {vehicle.name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {selectedVehicle && (
          <div className="mb-5 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <p className="text-sm text-neutral-400 mb-1">Viewing service history for</p>
            <p className="text-white font-medium">
              {selectedVehicle.brand} {selectedVehicle.model}
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Tracking by {trackingModeLabel.toLowerCase()}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-white mb-3">Service History</h2>

          {filteredServices.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-lg p-8 text-center">
              <Wrench className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 mb-2">No service records yet</p>
              <p className="text-neutral-500 text-sm mb-4">
                Start tracking maintenance for this vehicle
              </p>
              <Button
                onClick={() => {
                  if (!selectedVehicle) {
                    alert("Please select a vehicle first.");
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
                variant="outline"
                className="border-neutral-700 text-neutral-300"
              >
                Add First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const reading =
                  usageUnit === "hours" ? service.hours ?? 0 : service.mileage ?? 0;

                return (
                  <div
                    key={service.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-neutral-800">
                          <Wrench className="w-5 h-5 text-neutral-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white mb-1">{service.title}</h3>

                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs border-neutral-700 text-neutral-300"
                            >
                              {selectedVehicle?.name}
                            </Badge>
                          </div>

                          <p className="text-neutral-400 text-sm">
                            {service.description || "No notes added."}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-400 text-xs">
                          {formatDate(service.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-400 text-xs">
                          {reading} {usageUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}