import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Service } from "../types/service";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bike,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Filter,
  Package,
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useVehicles } from "../context/VehicleContext";
import { useServices } from "../context/ServiceContext";
import { useNotification } from "../context/NotificationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  calculateMaintenanceStatuses,
  getMaintenanceProfile,
  getTrackingModeLabel,
  getVehicleUsageUnit,
} from "../lib/maintenance";
import {
  getMaintenanceReminderSummary,
  getMaintenanceReminderText,
  getMaintenanceStatusClass,
  getMaintenanceStatusLabel,
  getUrgentMaintenanceStatuses,
} from "../lib/maintenanceReminders";

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
  const { showNotification } = useNotification();

  const { vehicles, activeVehicle, setActiveVehicleId } = useVehicles();

  const { addService, updateService, deleteService, getServicesForVehicle } =
    useServices();

  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicleId");

  const [hasAppliedUrlVehicleFilter, setHasAppliedUrlVehicleFilter] =
    useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const [activeReminderFilter, setActiveReminderFilter] = useState<
    "all" | "overdue" | "due_soon" | "never_logged"
  >("all");

  const [showAllReminderTasks, setShowAllReminderTasks] = useState(false);

  const [isServiceHistoryOpen, setIsServiceHistoryOpen] = useState(true);

  const [newService, setNewService] = useState({
    type: "",
    date: "",
    usageReading: "",
    cost: "",
    partsUsed: "",
    notes: "",
  });

  const [editService, setEditService] = useState({
    id: "",
    type: "",
    date: "",
    usageReading: "",
    cost: "",
    partsUsed: "",
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

  const maintenanceStatuses = selectedVehicle
    ? calculateMaintenanceStatuses(selectedVehicle, filteredServices)
    : [];

  const maintenanceReminderSummary =
    getMaintenanceReminderSummary(maintenanceStatuses);

  const urgentMaintenanceTasks =
    getUrgentMaintenanceStatuses(maintenanceStatuses);

  const filteredReminderTasks =
  activeReminderFilter === "all"
    ? urgentMaintenanceTasks
    : urgentMaintenanceTasks.filter(
        (task) => task.status === activeReminderFilter
      );

  const visibleReminderTasks = showAllReminderTasks
    ? filteredReminderTasks
    : filteredReminderTasks.slice(0, 3);

  const hasMoreReminderTasks =
    filteredReminderTasks.length > visibleReminderTasks.length;

  const serviceCosts = filteredServices
    .map((service) => service.cost ?? 0)
    .filter((cost) => cost > 0);

  const totalServiceCost = serviceCosts.reduce((total, cost) => total + cost, 0);

  const averageServiceCost =
    serviceCosts.length > 0 ? totalServiceCost / serviceCosts.length : 0;

  const latestServiceWithCost = filteredServices.find(
    (service) => (service.cost ?? 0) > 0
  );

  const latestServiceCost = latestServiceWithCost?.cost ?? 0;

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

  const selectedVehicleHeroImage =
    selectedVehicle?.bannerImage || selectedVehicle?.image || "";

  const selectedVehicleThumbImage = selectedVehicle?.image || "";

  const formatRand = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveVehicleId(vehicleId);
    setActiveReminderFilter("all");
    setShowAllReminderTasks(false);
    setIsServiceHistoryOpen(true);
  };

  const handleAddService = () => {
    if (!selectedVehicle) {
      showNotification({
        title: "Vehicle needed",
        message: "Please select a vehicle before adding a service entry.",
        variant: "warning",
      });

      return;
    }

    if (!newService.type || !newService.date) {
      showNotification({
        title: "Service details needed",
        message: "Please fill in the service type and date before saving.",
        variant: "warning",
      });

      return;
    }

    const numericReading = Number(newService.usageReading) || 0;
    const serviceCost = Number(newService.cost) || 0;

    addService({
      vehicleId: selectedVehicle.id,
      title: newService.type,
      description: newService.notes,
      cost: serviceCost,
      partsUsed: newService.partsUsed.trim(),
      date: newService.date,
      hours: usageUnit === "hours" ? numericReading : 0,
      mileage: usageUnit === "km" ? numericReading : 0,
    });

    setIsAddModalOpen(false);
    setIsServiceHistoryOpen(true);

    setNewService({
      type: "",
      date: "",
      usageReading: "",
      cost: "",
      partsUsed: "",
      notes: "",
    });

    showNotification({
      title: "Service added",
      message: `${newService.type} was added to ${selectedVehicle.brand} ${selectedVehicle.model}.`,
      variant: "success",
    });
  };

  const handleOpenEditService = (service: Service) => {
    const reading =
      usageUnit === "hours" ? service.hours ?? 0 : service.mileage ?? 0;

    setEditService({
      id: service.id,
      type: service.title,
      date: service.date,
      usageReading: String(reading),
      cost: service.cost ? String(service.cost) : "",
      partsUsed: service.partsUsed ?? "",
      notes: service.description ?? "",
    });

    setIsEditModalOpen(true);
  };

  const handleSaveEditService = () => {
    if (!selectedVehicle) {
      showNotification({
        title: "Vehicle needed",
        message: "Please select a vehicle before editing a service entry.",
        variant: "warning",
      });

      return;
    }

    if (!editService.type || !editService.date) {
      showNotification({
        title: "Service details needed",
        message: "Please fill in the service type and date before saving.",
        variant: "warning",
      });

      return;
    }

    const numericReading = Number(editService.usageReading) || 0;
    const serviceCost = Number(editService.cost) || 0;

    updateService(editService.id, {
      title: editService.type,
      description: editService.notes,
      cost: serviceCost,
      partsUsed: editService.partsUsed.trim(),
      date: editService.date,
      hours: usageUnit === "hours" ? numericReading : 0,
      mileage: usageUnit === "km" ? numericReading : 0,
    });

    setIsEditModalOpen(false);

    showNotification({
      title: "Service updated",
      message: `${editService.type} was updated for ${selectedVehicle.brand} ${selectedVehicle.model}.`,
      variant: "success",
    });
  };

  const handleConfirmDeleteService = () => {
    if (!serviceToDelete) return;

    deleteService(serviceToDelete.id);

    showNotification({
      title: "Service deleted",
      message: `${serviceToDelete.title} was removed from the service log.`,
      variant: "info",
    });

    setServiceToDelete(null);
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Add Service Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-h-[82vh] w-[calc(100%-2rem)] max-w-[390px] overflow-y-auto rounded-2xl border-neutral-800 bg-neutral-900 p-5 text-white modal-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-white">Add Service Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-neutral-300">Vehicle</Label>
              <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                {selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                  : "No vehicle selected"}
              </div>
            </div>

            <div>
              <Label className="text-neutral-300">Tracking Mode</Label>
              <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
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
                <SelectTrigger className="mt-1 border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent className="border-neutral-700 bg-neutral-800">
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
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
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
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Cost (R)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newService.cost}
                onChange={(e) =>
                  setNewService({ ...newService, cost: e.target.value })
                }
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Parts Used</Label>
              <Textarea
                placeholder="Example: Oil filter, engine oil, air filter..."
                value={newService.partsUsed}
                onChange={(e) =>
                  setNewService({ ...newService, partsUsed: e.target.value })
                }
                className="mt-1 min-h-20 border-neutral-700 bg-neutral-800 text-white"
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
                className="mt-1 min-h-20 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddService}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
            >
              Save Service Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[82vh] w-[calc(100%-2rem)] max-w-[390px] overflow-y-auto rounded-2xl border-neutral-800 bg-neutral-900 p-5 text-white modal-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Service Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-neutral-300">Vehicle</Label>
              <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                {selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                  : "No vehicle selected"}
              </div>
            </div>

            <div>
              <Label className="text-neutral-300">Tracking Mode</Label>
              <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                {trackingModeLabel || "N/A"}
              </div>
            </div>

            <div>
              <Label className="text-neutral-300">Service Type</Label>
              <Select
                value={editService.type}
                onValueChange={(val) =>
                  setEditService({ ...editService, type: val })
                }
              >
                <SelectTrigger className="mt-1 border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent className="border-neutral-700 bg-neutral-800">
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
                value={editService.date}
                onChange={(e) =>
                  setEditService({ ...editService, date: e.target.value })
                }
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">{usageFieldLabel}</Label>
              <Input
                type="number"
                placeholder="0"
                value={editService.usageReading}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    usageReading: e.target.value,
                  })
                }
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Cost (R)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editService.cost}
                onChange={(e) =>
                  setEditService({ ...editService, cost: e.target.value })
                }
                className="mt-1 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Parts Used</Label>
              <Textarea
                placeholder="Example: Oil filter, engine oil, air filter..."
                value={editService.partsUsed}
                onChange={(e) =>
                  setEditService({ ...editService, partsUsed: e.target.value })
                }
                className="mt-1 min-h-20 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Notes</Label>
              <Textarea
                placeholder="Add any notes..."
                value={editService.notes}
                onChange={(e) =>
                  setEditService({ ...editService, notes: e.target.value })
                }
                className="mt-1 min-h-20 border-neutral-700 bg-neutral-800 text-white"
              />
            </div>

            <Button
              type="button"
              onClick={handleSaveEditService}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open) setServiceToDelete(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[390px] rounded-2xl border-neutral-800 bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Delete Service Entry
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-neutral-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {serviceToDelete?.title}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              This will remove the service record from this vehicle.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceToDelete(null)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmDeleteService}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Header */}
      <div className="relative border-b border-neutral-800 bg-neutral-950">
        <div className="relative h-52 overflow-hidden">
          {selectedVehicleHeroImage ? (
            <img
              src={selectedVehicleHeroImage}
              alt={selectedVehicle?.name ?? "Vehicle service"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-neutral-950" />

          <div className="absolute left-4 top-4 z-10">
            <Link to="/profile">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
          </div>

          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => {
                if (!selectedVehicle) {
                  showNotification({
                    title: "Vehicle needed",
                    message:
                      "Please create and select a vehicle before adding a service entry.",
                    variant: "warning",
                  });

                  return;
                }

                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="absolute bottom-5 left-4 right-4 z-10">
            <div className="flex items-end gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
                {selectedVehicleThumbImage ? (
                  <img
                    src={selectedVehicleThumbImage}
                    alt={selectedVehicle?.name ?? "Vehicle"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bike className="h-8 w-8 text-orange-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Service Log
                </p>

                <h1 className="mt-1 truncate text-2xl font-bold text-white">
                  {selectedVehicle?.name ?? "Vehicle Service"}
                </h1>

                <p className="mt-1 truncate text-sm text-neutral-300">
                  {selectedVehicle
                    ? `${selectedVehicle.brand} ${selectedVehicle.model} • ${selectedVehicle.year}`
                    : "Select a vehicle to track maintenance."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 px-4 pb-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
            <div className="text-xl font-bold text-white">
              {filteredServices.length}
            </div>
            <div className="mt-0.5 text-xs text-neutral-400">Services</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
            <div className="text-xl font-bold text-white">
              {selectedVehicle ? trackingModeLabel : "-"}
            </div>
            <div className="mt-0.5 text-xs text-neutral-400">Tracking</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
            <div className="text-xl font-bold text-white">
              {selectedVehicle
                ? usageUnit === "hours"
                  ? selectedVehicle.hours.toFixed(0)
                  : selectedVehicle.mileage.toFixed(0)
                : "0"}
            </div>
            <div className="mt-0.5 text-xs text-neutral-400">
              Current {usageUnit === "hours" ? "Hours" : "KM"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-5">
        {/* Vehicle Selector */}
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">Choose Vehicle</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900 p-6 text-center">
              <p className="mb-2 text-neutral-400">
                No vehicles in your garage yet
              </p>

              <p className="text-sm text-neutral-500">
                Add a vehicle first to start logging service history.
              </p>
            </div>
          ) : (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
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
                        ? "bg-orange-500 text-black hover:bg-orange-400"
                        : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-white/80" />
                    {vehicle.name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Service Cost Summary */}
        {selectedVehicle && (
          <div className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Service Cost Summary
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Costs tracked for the selected vehicle.
                </p>
              </div>

              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Coins className="h-4 w-4" />
                  <p className="text-xs font-medium">Total Spent</p>
                </div>

                <p className="mt-2 text-lg font-bold text-white">
                  {formatRand(totalServiceCost)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <Coins className="h-4 w-4" />
                  <p className="text-xs font-medium">Average Cost</p>
                </div>

                <p className="mt-2 text-lg font-bold text-white">
                  {formatRand(averageServiceCost)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Calendar className="h-4 w-4" />
                  <p className="text-xs font-medium">Latest Cost</p>
                </div>

                <p className="mt-2 text-lg font-bold text-white">
                  {formatRand(latestServiceCost)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Wrench className="h-4 w-4" />
                  <p className="text-xs font-medium">Services</p>
                </div>

                <p className="mt-2 text-lg font-bold text-white">
                  {filteredServices.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Service Reminders */}
        {selectedVehicle && maintenanceStatuses.length > 0 && (
          <div className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Service Reminders
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Due soon and overdue maintenance for this vehicle.
                </p>
              </div>

              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                  maintenanceReminderSummary.overdueCount > 0
                    ? "bg-red-500/10 text-red-400"
                    : maintenanceReminderSummary.dueSoonCount > 0
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {maintenanceReminderSummary.overdueCount > 0 ||
                maintenanceReminderSummary.dueSoonCount > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                setActiveReminderFilter(
                  activeReminderFilter === "overdue" ? "all" : "overdue"
                );
                setShowAllReminderTasks(false);
              }}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  activeReminderFilter === "overdue"
                    ? "border-red-500/40 bg-red-500/15"
                    : "border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
                }`}
              >
                <p className="text-xs text-red-400">Overdue</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {maintenanceReminderSummary.overdueCount}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveReminderFilter(
                    activeReminderFilter === "due_soon" ? "all" : "due_soon"
                  );
                  setShowAllReminderTasks(false);
                }}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  activeReminderFilter === "due_soon"
                    ? "border-orange-500/40 bg-orange-500/15"
                    : "border-orange-500/10 bg-orange-500/5 hover:bg-orange-500/10"
                }`}
              >
                <p className="text-xs text-orange-400">Due Soon</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {maintenanceReminderSummary.dueSoonCount}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveReminderFilter(
                    activeReminderFilter === "never_logged" ? "all" : "never_logged"
                  );
                  setShowAllReminderTasks(false);
                }}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  activeReminderFilter === "never_logged"
                    ? "border-neutral-500 bg-neutral-800"
                    : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
                }`}
              >
                <p className="text-xs text-neutral-400">Not Logged</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {maintenanceReminderSummary.neverLoggedCount}
                </p>
              </button>
            </div>

            {filteredReminderTasks.length === 0 ? (
              <div className="mt-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      No reminders in this filter
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Try another reminder category or show all reminders.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {visibleReminderTasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                    >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {task.label}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Every {task.interval} {task.unit}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getMaintenanceStatusClass(
                          task.status
                        )}`}
                      >
                        {getMaintenanceStatusLabel(task.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-medium text-neutral-300">
                      {getMaintenanceReminderText(task)}
                    </p>

                    {task.lastServiceDate && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Last done: {formatDate(task.lastServiceDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {hasMoreReminderTasks && (
                  <button
                    type="button"
                    onClick={() => setShowAllReminderTasks(true)}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                  >
                    View all reminders
                  </button>
                )}

                {showAllReminderTasks && filteredReminderTasks.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReminderTasks(false)}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-300"
                  >
                    Show fewer
                  </button>
                )}

                {activeReminderFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReminderFilter("all");
                      setShowAllReminderTasks(false);
                    }}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-300"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

        {/* Service History */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900">
          <button
            type="button"
            onClick={() => setIsServiceHistoryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
          >
            <div>
              <h2 className="text-base font-semibold text-white">
                Service History
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                {filteredServices.length} service entr
                {filteredServices.length === 1 ? "y" : "ies"} logged.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400">
              {isServiceHistoryOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          {isServiceHistoryOpen && (
            <div className="border-t border-neutral-800 px-4 pb-4 pt-4">
              {filteredServices.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-950 p-8 text-center">
                  <Wrench className="mx-auto mb-3 h-12 w-12 text-neutral-600" />

                  <p className="mb-2 text-neutral-400">
                    No service records yet
                  </p>

                  <p className="mb-4 text-sm text-neutral-500">
                    Start tracking maintenance for this vehicle
                  </p>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!selectedVehicle) {
                        showNotification({
                          title: "Vehicle needed",
                          message:
                            "Please select a vehicle before adding the first service entry.",
                          variant: "warning",
                        });

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
                      usageUnit === "hours"
                        ? service.hours ?? 0
                        : service.mileage ?? 0;

                    return (
                      <div
                        key={service.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                              <Wrench className="h-5 w-5 text-neutral-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="mb-1 text-white">
                                {service.title}
                              </h3>

                              <div className="mb-2 flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-neutral-700 text-xs text-neutral-300"
                                >
                                  {selectedVehicle?.name}
                                </Badge>
                              </div>

                              <p className="text-sm text-neutral-400">
                                {service.description || "No notes added."}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(service)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setServiceToDelete(service)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/15"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-neutral-800 pt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-500" />
                            <span className="text-xs text-neutral-400">
                              {formatDate(service.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-500" />
                            <span className="text-xs text-neutral-400">
                              {reading} {usageUnit}
                            </span>
                          </div>
                        </div>

                        {((service.cost ?? 0) > 0 || service.partsUsed) && (
                          <div className="mt-3 grid gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3">
                            {(service.cost ?? 0) > 0 && (
                              <div className="flex items-center gap-2 text-sm text-neutral-300">
                                <Coins className="h-4 w-4 text-emerald-400" />
                                <span>
                                  Cost: {formatRand(Number(service.cost ?? 0))}
                                </span>
                              </div>
                            )}

                            {service.partsUsed && (
                              <div className="flex items-start gap-2 text-sm text-neutral-300">
                                <Package className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />
                                <span>Parts: {service.partsUsed}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}