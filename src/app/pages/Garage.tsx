import { useRef, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Gauge,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router";
import { useServices } from "../context/ServiceContext";
import { calculateMaintenanceStatuses } from "../lib/maintenance";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  getMaintenanceReminderSummary,
  getUrgentMaintenanceStatuses,
} from "../lib/maintenanceReminders";
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
import { useVehicles } from "../context/VehicleContext";
import type { Vehicle, VehicleType } from "../types/vehicle";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import {
  FREE_PLAN_VEHICLE_LIMIT,
  getGarageAccess,
} from "../lib/accessControl";

const vehicleTypeOptions: { label: string; value: VehicleType }[] = [
  { label: "Dirt Bike", value: "dirt-bike" },
  { label: "Adventure Bike", value: "adventure-bike" },
  { label: "Quad", value: "quad" },
  { label: "SXS", value: "sxs" },
  { label: "4x4", value: "4x4" },
  { label: "Other", value: "other" },
];

const colorOptions = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
];

const hourBasedVehicleTypes: VehicleType[] = [
  "dirt-bike",
  "adventure-bike",
  "quad",
  "sxs",
];

function vehicleUsesEngineHours(type: "" | VehicleType) {
  return type !== "" && hourBasedVehicleTypes.includes(type);
}

function getVehicleTypeLabel(type: VehicleType) {
  return (
    vehicleTypeOptions.find((option) => option.value === type)?.label ?? type
  );
}

function getGarageSetupCompletionScore(vehicle: {
  name?: string;
  type?: "" | VehicleType;
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
  color?: string;
}) {
  const completedItems = [
    Boolean(vehicle.name?.trim()),
    Boolean(vehicle.type),
    Boolean(vehicle.brand?.trim()),
    Boolean(vehicle.model?.trim()),
    Boolean(vehicle.year),
    Number(vehicle.hoursAtPurchase ?? vehicle.hours ?? 0) > 0,
    Number(vehicle.mileage ?? 0) > 0,
    Boolean(vehicle.notes?.trim()),
    Boolean(vehicle.image),
    Boolean(vehicle.bannerImage),
    Boolean(vehicle.color),
  ].filter(Boolean).length;

  return Math.round((completedItems / 11) * 100);
}

function getReadyStatus(summary: {
  overdueCount: number;
  dueSoonCount: number;
  neverLoggedCount: number;
}) {
  if (summary.overdueCount > 0) {
    return {
      label: "Service overdue",
      description: "Maintenance attention needed",
      className: "border-red-500/20 bg-red-500/10 text-red-400",
    };
  }

  if (summary.dueSoonCount > 0) {
    return {
      label: "Due soon",
      description: "Service coming up",
      className: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    };
  }

  if (summary.neverLoggedCount > 0) {
    return {
      label: "Setup needed",
      description: "Start logging maintenance",
      className: "border-neutral-700 bg-neutral-900 text-neutral-300",
    };
  }

  return {
    label: "Ready to ride",
    description: "No urgent reminders",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };
}

const vehicleDialogContentClass =
  "left-1/2 top-1/2 max-h-[76vh] w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-neutral-800 bg-neutral-900 p-5 text-white modal-scrollbar";

const vehicleDialogBodyClass = "space-y-4 py-4";

const vehicleDialogSectionClass =
  "rounded-xl border border-neutral-800 bg-neutral-950 p-3";

const vehicleDialogStickyActionClass =
  "sticky -bottom-5 mt-2 border-t border-neutral-800 bg-neutral-900 pt-4";

const vehicleDialogUploadButtonClass =
  "w-full border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getVehicleInitials(name: string) {
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function Garage() {
  const { showNotification } = useNotification();
  const { currentUserAccess } = useUserAccess();
  const {
  vehicles,
  activeVehicleId,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setActiveVehicleId,
} = useVehicles();

  const { getServicesForVehicle } = useServices();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "" as "" | VehicleType,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    hours: 0,
    hoursAtPurchase: 0,
    manualAddedHours: 0,
    mileage: 0,
    notes: "",
    image: "",
    bannerImage: "",
    color: "#ef4444",
  });

  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const [vehicleToDelete, setVehicleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<"all" | VehicleType>(
    "all"
  );

  const [garageSort, setGarageSort] = useState<
    "active_first" | "newest" | "oldest" | "name" | "hours_high" | "km_high"
  >("active_first");

  const [editVehicle, setEditVehicle] = useState({
    name: "",
    type: "" as "" | VehicleType,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    hours: 0,
    hoursAtPurchase: 0,
    manualAddedHours: 0,
    mileage: 0,
    notes: "",
    color: "#ef4444",
    image: "",
    bannerImage: "",
  });

  const garageAccess = getGarageAccess(currentUserAccess, vehicles.length);

  const isVehicleLimitReached = garageAccess.isVehicleLimitReached;

  const garageVehicleLimitLabel = garageAccess.vehicleLimitLabel;

  const newVehicleUsesHours = vehicleUsesEngineHours(newVehicle.type);
  const editVehicleUsesHours = vehicleUsesEngineHours(editVehicle.type);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        title: "Image file needed",
        message: "Please upload a valid image file.",
        variant: "warning",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewVehicle((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const handleBannerImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        title: "Image file needed",
        message: "Please upload a valid image file.",
        variant: "warning",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewVehicle((prev) => ({
          ...prev,
          bannerImage: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        title: "Image file needed",
        message: "Please upload a valid image file.",
        variant: "warning",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditVehicle((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const handleEditBannerImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        title: "Image file needed",
        message: "Please upload a valid image file.",
        variant: "warning",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditVehicle((prev) => ({
          ...prev,
          bannerImage: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const handleOpenEditVehicle = (vehicle: {
    id: string;
    name: string;
    type: VehicleType;
    brand: string;
    model: string;
    year: number;
    hours: number;
    hoursAtPurchase?: number;
    manualAddedHours?: number;
    mileage: number;
    notes?: string;
    image?: string;
    bannerImage?: string;
    color?: string;
  }) => {
    setEditingVehicleId(vehicle.id);
    setEditVehicle({
      name: vehicle.name,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      hours: vehicle.hoursAtPurchase ?? vehicle.hours,
      hoursAtPurchase: vehicle.hoursAtPurchase ?? vehicle.hours,
      manualAddedHours: vehicle.manualAddedHours ?? 0,
      mileage: vehicle.mileage,
      notes: vehicle.notes ?? "",
      color: vehicle.color ?? "#ef4444",
      image: vehicle.image ?? "",
      bannerImage: vehicle.bannerImage ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleAddVehicle = () => {
    if (isVehicleLimitReached) {
      showNotification({
        title: "Vehicle limit reached",
        message: `The free plan allows up to ${FREE_PLAN_VEHICLE_LIMIT} vehicles. Subscribe to the Pro Plan to add unlimited vehicles.`,
        variant: "warning",
      });

      return;
    }

    if (
      !newVehicle.name.trim() ||
      !newVehicle.type ||
      !newVehicle.brand.trim() ||
      !newVehicle.model.trim()
    ) {
      showNotification({
        title: "Vehicle details needed",
        message: "Please fill in vehicle name, type, brand, and model.",
        variant: "warning",
      });

      return;
    }

    addVehicle({
      name: newVehicle.name.trim(),
      type: newVehicle.type,
      brand: newVehicle.brand.trim(),
      model: newVehicle.model.trim(),
      year: Number(newVehicle.year),
      hours: Number(newVehicle.hoursAtPurchase),
      hoursAtPurchase: Number(newVehicle.hoursAtPurchase),
      manualAddedHours: Number(newVehicle.manualAddedHours),
      mileage: Number(newVehicle.mileage),
      notes: newVehicle.notes.trim(),
      color: newVehicle.color,
      image: newVehicle.image,
      bannerImage: newVehicle.bannerImage,
    });

    setIsAddModalOpen(false);
    setNewVehicle({
      name: "",
      type: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      hours: 0,
      hoursAtPurchase: 0,
      manualAddedHours: 0,
      mileage: 0,
      notes: "",
      color: "#ef4444",
      image: "",
      bannerImage: "",
    });
    showNotification({
      title: "Vehicle added",
      message: `${newVehicle.name.trim()} was added to your garage.`,
      variant: "success",
    });
  };

  const handleSaveEditVehicle = () => {
    if (!editingVehicleId) return;

    if (
      !editVehicle.name.trim() ||
      !editVehicle.type ||
      !editVehicle.brand.trim() ||
      !editVehicle.model.trim()
    ) {
      showNotification({
        title: "Vehicle details needed",
        message: "Please fill in vehicle name, type, brand, and model.",
        variant: "warning",
      });
      return;
    }

    updateVehicle(editingVehicleId, {
      name: editVehicle.name.trim(),
      type: editVehicle.type,
      brand: editVehicle.brand.trim(),
      model: editVehicle.model.trim(),
      year: Number(editVehicle.year),
      hours: Number(editVehicle.hoursAtPurchase),
      hoursAtPurchase: Number(editVehicle.hoursAtPurchase),
      manualAddedHours: Number(editVehicle.manualAddedHours),
      mileage: Number(editVehicle.mileage),
      notes: editVehicle.notes.trim(),
      color: editVehicle.color,
      image: editVehicle.image,
      bannerImage: editVehicle.bannerImage,
    });

    setIsEditModalOpen(false);
    setEditingVehicleId(null);

    showNotification({
      title: "Vehicle updated",
      message: `${editVehicle.name.trim()} was updated successfully.`,
      variant: "success",
    });
  };

  const handleConfirmDeleteVehicle = () => {
    if (!vehicleToDelete) return;

    deleteVehicle(vehicleToDelete.id);

    showNotification({
      title: "Vehicle deleted",
      message: `${vehicleToDelete.name} was removed from your garage.`,
      variant: "info",
    });

    setVehicleToDelete(null);
  };

  const handleDuplicateVehicle = (vehicle: Vehicle) => {
    if (isVehicleLimitReached) {
      showNotification({
        title: "Vehicle limit reached",
        message: `The free plan allows up to ${FREE_PLAN_VEHICLE_LIMIT} vehicles. Subscribe to the Pro Plan to add unlimited vehicles.`,
        variant: "warning",
      });

      return;
    }

    addVehicle({
      name: `${vehicle.name} Copy`,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      hours: vehicle.hoursAtPurchase ?? vehicle.hours,
      hoursAtPurchase: vehicle.hoursAtPurchase ?? vehicle.hours,
      manualAddedHours: vehicle.manualAddedHours ?? 0,
      mileage: vehicle.mileage,
      notes: vehicle.notes ?? "",
      color: vehicle.color ?? "#ef4444",
      image: vehicle.image ?? "",
      bannerImage: vehicle.bannerImage ?? "",
    });

    showNotification({
      title: "Vehicle duplicated",
      message: `${vehicle.name} was duplicated in your garage.`,
      variant: "success",
    });
  };

  const visibleVehicles = [...vehicles]
    .filter((vehicle) => {
      if (vehicleTypeFilter === "all") return true;
      return vehicle.type === vehicleTypeFilter;
    })
    .sort((a, b) => {
      if (garageSort === "active_first") {
        if (a.id === activeVehicleId) return -1;
        if (b.id === activeVehicleId) return 1;
        return a.name.localeCompare(b.name);
      }

      if (garageSort === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (garageSort === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (garageSort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (garageSort === "hours_high") {
        return (b.hours ?? 0) - (a.hours ?? 0);
      }

      if (garageSort === "km_high") {
        return (b.mileage ?? 0) - (a.mileage ?? 0);
      }

      return 0;
    });

  const hasGarageFiltersActive =
    vehicleTypeFilter !== "all" || garageSort !== "active_first";

  const garageVehicleInsights = vehicles.map((vehicle) => {
    const statuses = calculateMaintenanceStatuses(
      vehicle,
      getServicesForVehicle(vehicle.id)
    );

    const summary = getMaintenanceReminderSummary(statuses);
    const setupScore = getGarageSetupCompletionScore(vehicle);
    const readyStatus = getReadyStatus(summary);

    return {
      vehicle,
      statuses,
      summary,
      setupScore,
      readyStatus,
    };
  });

  const totalVehicles = vehicles.length;
  const totalMiles = vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0);
  const totalHours = vehicles.reduce((sum, vehicle) => sum + vehicle.hours, 0);

  const serviceAttentionCount = garageVehicleInsights.filter(
    (item) => item.summary.overdueCount > 0 || item.summary.dueSoonCount > 0
  ).length;

  const readyVehicleCount = garageVehicleInsights.filter(
    (item) =>
      item.summary.overdueCount === 0 &&
      item.summary.dueSoonCount === 0 &&
      item.summary.neverLoggedCount === 0
  ).length;

  const averageSetupCompletion =
    totalVehicles > 0
      ? Math.round(
          garageVehicleInsights.reduce((sum, item) => sum + item.setupScore, 0) /
            totalVehicles
        )
      : 0;

  const highestKmVehicle = [...vehicles].sort(
    (a, b) => (b.mileage ?? 0) - (a.mileage ?? 0)
  )[0];

  const highestHourVehicle = [...vehicles].sort(
    (a, b) => (b.hours ?? 0) - (a.hours ?? 0)
  )[0];

  const needsAttentionVehicle = garageVehicleInsights.find(
    (item) => item.summary.overdueCount > 0 || item.summary.dueSoonCount > 0
  )?.vehicle;

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl mb-1">My Garage</h1>
            <p className="text-neutral-400 text-sm">Manage your vehicles</p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                className={`bg-red-600 hover:bg-red-700 gap-2 ${
                  isVehicleLimitReached ? "opacity-60" : ""
                }`}
                onClick={(event) => {
                  if (isVehicleLimitReached) {
                    event.preventDefault();
                    event.stopPropagation();

                    showNotification({
                      title: "Vehicle limit reached",
                      message: `The free plan allows up to ${FREE_PLAN_VEHICLE_LIMIT} vehicles. Subscribe to the Pro Plan to add unlimited vehicles.`,
                      variant: "warning",
                    });
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>

            <DialogContent className={vehicleDialogContentClass}>
              <DialogHeader>
                <DialogTitle className="text-white">Add New Vehicle</DialogTitle>
              </DialogHeader>

              <div className={vehicleDialogBodyClass}>
                <div>
                  <Label className="text-neutral-300">Vehicle Name</Label>
                  <Input
                    placeholder="e.g. My Honda 450"
                    value={newVehicle.name}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, name: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Vehicle Type</Label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(val: VehicleType) =>
                      setNewVehicle({ ...newVehicle, type: val })
                    }
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {vehicleTypeOptions.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-white"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-300">Brand</Label>
                  <Input
                    placeholder="e.g. Honda"
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Model</Label>
                  <Input
                    placeholder="e.g. CRF450X"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Year</Label>
                  <Input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        year: Number(e.target.value),
                      })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {editVehicleUsesHours && (
                    <>
                      <div>
                        <Label className="text-neutral-300">Hours at purchase</Label>
                        <Input
                          type="number"
                          value={editVehicle.hoursAtPurchase}
                          onChange={(event) =>
                            setEditVehicle((prev) => ({
                              ...prev,
                              hours: Number(event.target.value),
                              hoursAtPurchase: Number(event.target.value),
                            }))
                          }
                          className="bg-neutral-800 border-neutral-700 text-white mt-1"
                        />
                        <p className="text-xs text-neutral-500">
                          Engine hours already on the vehicle when you bought it.
                        </p>
                      </div>

                      <div>
                        <Label className="text-neutral-300">Manual added hours</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editVehicle.manualAddedHours}
                          onChange={(e) =>
                            setEditVehicle({
                              ...editVehicle,
                              manualAddedHours: Number(e.target.value),
                            })
                          }
                          className="bg-neutral-800 border-neutral-700 text-white mt-1"
                        />
                        <p className="mt-1 text-xs text-neutral-500">
                          Extra engine hours ridden outside Xtrail.
                        </p>
                      </div>
                    </>
                  )}

                  <div className={editVehicleUsesHours ? "" : "col-span-2"}>
                    <Label className="text-neutral-300">
                      {editVehicle.type === "4x4" ? "Current KM" : "Mileage / KM"}
                    </Label>
                    <Input
                      type="number"
                      value={editVehicle.mileage}
                      onChange={(e) =>
                        setEditVehicle({
                          ...editVehicle,
                          mileage: Number(e.target.value),
                        })
                      }
                      className="bg-neutral-800 border-neutral-700 text-white mt-1"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      {editVehicleUsesHours
                        ? "Optional distance reading for this vehicle."
                        : "Main usage reading for this vehicle type."}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-300">Notes</Label>
                  <Input
                    placeholder="Any notes about this vehicle"
                    value={newVehicle.notes}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, notes: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Color Theme</Label>

                  <div className="mt-1 grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setNewVehicle({ ...newVehicle, color: color.value })
                        }
                        className={`h-10 w-full rounded-lg border-2 transition-all ${
                          newVehicle.color === color.value
                            ? "scale-110 border-white"
                            : "border-neutral-700 hover:border-neutral-600"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Vehicle Photo */}
                <div className={vehicleDialogSectionClass}>
                  <Label className="text-neutral-300">Vehicle Photo</Label>

                  <p className="mt-1 text-xs text-neutral-500">
                    Square image used on vehicle cards and profile previews.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="mt-3 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className={vehicleDialogUploadButtonClass}
                    >
                      Upload Vehicle Photo
                    </Button>

                    {newVehicle.image && (
                      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                        <img
                          src={newVehicle.image}
                          alt="Vehicle preview"
                          className="h-36 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Image */}
                <div className={vehicleDialogSectionClass}>
                  <Label className="text-neutral-300">Banner Image</Label>

                  <p className="mt-1 text-xs text-neutral-500">
                    Wide image used at the top of the vehicle profile.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    className="mt-3 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
                  />

                  {newVehicle.bannerImage && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                      <img
                        src={newVehicle.bannerImage}
                        alt="Banner preview"
                        className="h-28 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className={vehicleDialogStickyActionClass}>
                  <Button
                    type="button"
                    onClick={handleAddVehicle}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Add Vehicle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{totalVehicles}</div>
            <div className="text-neutral-400 text-xs">Vehicles</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{totalMiles.toFixed(0)}</div>
            <div className="text-neutral-400 text-xs">KM</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{totalHours.toFixed(0)}</div>
            <div className="text-neutral-400 text-xs">Hours</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="space-y-4">

          {/* Garage Dashboard */}
          {vehicles.length > 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Garage Dashboard
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Quick overview of garage readiness and setup.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Ready to ride</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {readyVehicleCount}/{totalVehicles}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Needs service</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {serviceAttentionCount}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Setup completion</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {averageSetupCompletion}%
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Vehicle limit</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {garageVehicleLimitLabel}
                  </p>
                </div>
              </div>

              {isVehicleLimitReached && (
                <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
                  <p className="text-xs font-semibold text-orange-400">
                    Free garage limit reached
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Subscribe to add unlimited vehicles.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vehicle Comparison */}
          {vehicles.length > 1 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Vehicle Comparison
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Quick comparison across your garage.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3">
                {highestKmVehicle && (
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3">
                    <div>
                      <p className="text-xs text-neutral-500">Highest KM</p>
                      <p className="text-sm font-semibold text-white">
                        {highestKmVehicle.name}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-300">
                      {highestKmVehicle.mileage.toFixed(0)} km
                    </p>
                  </div>
                )}

                {highestHourVehicle && (
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3">
                    <div>
                      <p className="text-xs text-neutral-500">Highest Hours</p>
                      <p className="text-sm font-semibold text-white">
                        {highestHourVehicle.name}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-300">
                      {highestHourVehicle.hours.toFixed(0)} h
                    </p>
                  </div>
                )}

                {needsAttentionVehicle ? (
                  <div className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
                    <div>
                      <p className="text-xs text-orange-400">Needs attention</p>
                      <p className="text-sm font-semibold text-white">
                        {needsAttentionVehicle.name}
                      </p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
                    <div>
                      <p className="text-xs text-emerald-400">Garage readiness</p>
                      <p className="text-sm font-semibold text-white">
                        All vehicles look good
                      </p>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Garage Controls */}
          {vehicles.length > 0 && (
            <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">Garage Controls</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Filter and sort your vehicles.
                  </p>
                </div>

                {hasGarageFiltersActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleTypeFilter("all");
                      setGarageSort("active_first");
                    }}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-400">Vehicle Type</Label>

                  <Select
                    value={vehicleTypeFilter}
                    onValueChange={(value) =>
                      setVehicleTypeFilter(value as "all" | VehicleType)
                    }
                  >
                    <SelectTrigger className="mt-1 border-neutral-700 bg-neutral-800 text-white">
                      <SelectValue placeholder="All vehicles" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-700 bg-neutral-800">
                      <SelectItem value="all" className="text-white">
                        All
                      </SelectItem>

                      {vehicleTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-neutral-400">Sort By</Label>

                  <Select
                    value={garageSort}
                    onValueChange={(value) =>
                      setGarageSort(
                        value as
                          | "active_first"
                          | "newest"
                          | "oldest"
                          | "name"
                          | "hours_high"
                          | "km_high"
                      )
                    }
                  >
                    <SelectTrigger className="mt-1 border-neutral-700 bg-neutral-800 text-white">
                      <SelectValue placeholder="Sort vehicles" />
                    </SelectTrigger>

                    <SelectContent className="border-neutral-700 bg-neutral-800">
                      <SelectItem value="active_first" className="text-white">
                        Active first
                      </SelectItem>
                      <SelectItem value="newest" className="text-white">
                        Newest
                      </SelectItem>
                      <SelectItem value="oldest" className="text-white">
                        Oldest
                      </SelectItem>
                      <SelectItem value="name" className="text-white">
                        Name A-Z
                      </SelectItem>
                      <SelectItem value="hours_high" className="text-white">
                        Highest hours
                      </SelectItem>
                      <SelectItem value="km_high" className="text-white">
                        Highest KM
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                Showing {visibleVehicles.length} of {vehicles.length} vehicle
                {vehicles.length === 1 ? "" : "s"}.
              </p>
            </div>
          )}
          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-white">
                No vehicles yet
              </h3>

              <p className="mb-4 text-sm text-neutral-400">
                Add your first vehicle to start tracking rides, service, setup, and maintenance.
              </p>

              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Add Your First Vehicle
              </Button>
            </div>
          ) : visibleVehicles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-white">
                No vehicles match this filter
              </h3>

              <p className="mb-4 text-sm text-neutral-400">
                Try changing the vehicle type filter or reset the garage controls.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVehicleTypeFilter("all");
                  setGarageSort("active_first");
                }}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleVehicles.map((vehicle) => {
            const color = vehicle.color || "#ef4444";
            const isActive = activeVehicleId === vehicle.id;

            const vehicleMaintenanceStatuses = calculateMaintenanceStatuses(
              vehicle,
              getServicesForVehicle(vehicle.id)
            );

            const vehicleMaintenanceSummary = getMaintenanceReminderSummary(
              vehicleMaintenanceStatuses
            );

            const topUrgentMaintenanceTask =
                getUrgentMaintenanceStatuses(vehicleMaintenanceStatuses)[0];

              const vehicleSetupCompletion = getGarageSetupCompletionScore(vehicle);
              const vehicleReadyStatus = getReadyStatus(vehicleMaintenanceSummary);

              return (
                <div
                  key={vehicle.id}
                  className={`relative overflow-hidden bg-neutral-900 border rounded-lg p-5 pt-6 transition-colors ${
                    isActive ? "" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                  style={{
                    borderColor: isActive ? color : undefined,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 bg-neutral-800"
                        style={{ borderColor: color }}
                      >
                        {vehicle.image ? (
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl">
                            {getVehicleInitials(vehicle.name)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white text-lg">{vehicle.name}</h3>
                          {isActive && (
                            <Badge
                              className="text-white"
                              style={{ backgroundColor: color }}
                            >
                              Active
                            </Badge>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: color, color }}
                        >
                          {getVehicleTypeLabel(vehicle.type)}
                        </Badge>

                        <p className="text-neutral-400 text-sm mt-2">
                          {vehicle.brand} {vehicle.model} • {vehicle.year}
                        </p>
                        <Link
                          to={`/service-log?vehicleId=${vehicle.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-3 block"
                        >
                          {vehicleMaintenanceSummary.overdueCount > 0 ? (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 transition hover:bg-red-500/15">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />

                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-red-400">
                                    {vehicleMaintenanceSummary.overdueCount} overdue service
                                    {vehicleMaintenanceSummary.overdueCount === 1 ? "" : "s"}
                                  </p>

                                  {topUrgentMaintenanceTask && (
                                    <p className="mt-1 truncate text-xs text-neutral-400">
                                      {topUrgentMaintenanceTask.label}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : vehicleMaintenanceSummary.dueSoonCount > 0 ? (
                            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 transition hover:bg-orange-500/15">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />

                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-orange-400">
                                    {vehicleMaintenanceSummary.dueSoonCount} service due soon
                                  </p>

                                  {topUrgentMaintenanceTask && (
                                    <p className="mt-1 truncate text-xs text-neutral-400">
                                      {topUrgentMaintenanceTask.label}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : vehicleMaintenanceSummary.neverLoggedCount > 0 ? (
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 transition hover:bg-neutral-800">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />

                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-neutral-300">
                                    Maintenance not logged
                                  </p>

                                  {topUrgentMaintenanceTask && (
                                    <p className="mt-1 truncate text-xs text-neutral-500">
                                      {topUrgentMaintenanceTask.label}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 transition hover:bg-emerald-500/15">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />

                                <div>
                                  <p className="text-xs font-semibold text-emerald-400">
                                    Maintenance OK
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-400">
                                    Tap to view service log
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Link>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() =>
                        setVehicleToDelete({
                          id: vehicle.id,
                          name: vehicle.name,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center bg-neutral-950 rounded-lg p-3">
                      <div className="text-white text-lg mb-0.5">
                        {vehicle.hours.toFixed(0)}
                      </div>
                      <div className="text-neutral-500 text-xs">hours</div>
                    </div>

                    <div className="text-center bg-neutral-950 rounded-lg p-3">
                      <div className="text-white text-lg mb-0.5">
                        {vehicle.mileage.toFixed(0)}
                      </div>
                      <div className="text-neutral-500 text-xs">km</div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl border px-3 py-3 ${vehicleReadyStatus.className}`}
                    >
                      <div className="flex items-center gap-2">
                        {vehicleReadyStatus.label === "Ready to ride" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}

                        <p className="text-xs font-semibold">{vehicleReadyStatus.label}</p>
                      </div>

                      <p className="mt-1 text-xs text-neutral-400">
                        {vehicleReadyStatus.description}
                      </p>
                    </div>

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Gauge className="h-4 w-4" />
                        <p className="text-xs font-semibold">Setup</p>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${vehicleSetupCompletion}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-neutral-400">
                        {vehicleSetupCompletion}% complete
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Added: {formatDate(vehicle.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-neutral-400 hover:text-white"
                        onClick={() => handleDuplicateVehicle(vehicle)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-neutral-400 hover:text-white"
                        onClick={() => handleOpenEditVehicle(vehicle)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-neutral-300"
                          style={{ borderColor: color }}
                          onClick={() => setActiveVehicleId(vehicle.id)}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set Active
                        </Button>
                      )}

                      <Link
                        to={`/garage/${vehicle.id}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-neutral-700 text-neutral-300 h-7 text-xs"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}
        </div>

        {vehicles.length > 0 && !isVehicleLimitReached && (
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="w-full mt-4 border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6 border-dashed"
          >
            <Plus className="w-5 h-5" />
            Add Another Vehicle
          </Button>
        )}

        {vehicles.length > 0 && isVehicleLimitReached && (
          <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-orange-400">
              Free vehicle limit reached
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              You have reached the {FREE_PLAN_VEHICLE_LIMIT}-vehicle free garage limit. Subscribe to the Pro Plan to add unlimited vehicles.
            </p>
          </div>
        )}
      </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={vehicleDialogContentClass}>
          <DialogHeader>
            <DialogTitle className="text-white">Edit Vehicle</DialogTitle>
          </DialogHeader>

          <div className={vehicleDialogBodyClass}>
            <div>
              <Label className="text-neutral-300">Vehicle Name</Label>
              <Input
                value={editVehicle.name}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, name: e.target.value })
                }
                className="bg-neutral-800 border-neutral-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Vehicle Type</Label>
              <Select
                value={editVehicle.type}
                onValueChange={(val: VehicleType) =>
                  setEditVehicle({ ...editVehicle, type: val })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {vehicleTypeOptions.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-white"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-neutral-300">Brand</Label>
              <Input
                value={editVehicle.brand}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, brand: e.target.value })
                }
                className="bg-neutral-800 border-neutral-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Model</Label>
              <Input
                value={editVehicle.model}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, model: e.target.value })
                }
                className="bg-neutral-800 border-neutral-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Year</Label>
              <Input
                type="number"
                value={editVehicle.year}
                onChange={(e) =>
                  setEditVehicle({
                    ...editVehicle,
                    year: Number(e.target.value),
                  })
                }
                className="bg-neutral-800 border-neutral-700 text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-neutral-300">Hours at purchase</Label>
                <Input
                  type="number"
                  value={editVehicle.hoursAtPurchase}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      hours: Number(event.target.value),
                      hoursAtPurchase: Number(event.target.value),
                    }))
                  }
                  className="bg-neutral-800 border-neutral-700 text-white mt-1"
                />
                <p className="text-xs text-neutral-500">
                  Engine hours already on the vehicle when you bought it.
                </p>
              </div>

              <div>
                <Label className="text-neutral-300">Manual added hours</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editVehicle.manualAddedHours}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      manualAddedHours: Number(e.target.value),
                    })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white mt-1"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Extra engine hours ridden outside Xtrail after you bought the vehicle.
                </p>
              </div>

              <div>
                <Label className="text-neutral-300">Mileage</Label>
                <Input
                  type="number"
                  value={editVehicle.mileage}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      mileage: Number(e.target.value),
                    })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-neutral-300">Notes</Label>
              <Input
                value={editVehicle.notes}
                onChange={(e) =>
                  setEditVehicle({ ...editVehicle, notes: e.target.value })
                }
                className="bg-neutral-800 border-neutral-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Color Theme</Label>

              <div className="mt-1 grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setEditVehicle({ ...editVehicle, color: color.value })
                    }
                    className={`h-10 w-full rounded-lg border-2 transition-all ${
                      editVehicle.color === color.value
                        ? "scale-110 border-white"
                        : "border-neutral-700 hover:border-neutral-600"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Vehicle Photo */}
            <div className={vehicleDialogSectionClass}>
              <Label className="text-neutral-300">Vehicle Photo</Label>

              <p className="mt-1 text-xs text-neutral-500">
                Square image used on vehicle cards and profile previews.
              </p>

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                className="hidden"
              />

              <div className="mt-3 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => editFileInputRef.current?.click()}
                  className={vehicleDialogUploadButtonClass}
                >
                  Upload New Photo
                </Button>

                {editVehicle.image && (
                  <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                    <img
                      src={editVehicle.image}
                      alt="Vehicle preview"
                      className="h-36 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Banner Image */}
            <div className={vehicleDialogSectionClass}>
              <Label className="text-neutral-300">Banner Image</Label>

              <p className="mt-1 text-xs text-neutral-500">
                Wide image used at the top of the vehicle profile.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleEditBannerImageUpload}
                className="mt-3 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
              />

              {editVehicle.bannerImage && (
                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                  <img
                    src={editVehicle.bannerImage}
                    alt="Banner preview"
                    className="h-28 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className={vehicleDialogStickyActionClass}>
              <Button
                type="button"
                onClick={handleSaveEditVehicle}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(vehicleToDelete)}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null);
        }}
      >
        <DialogContent className="left-1/2 top-1/2 w-[calc(100%-3rem)] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-neutral-800 bg-neutral-900 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Vehicle</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-neutral-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {vehicleToDelete?.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              This will remove the vehicle from your garage. This action cannot be
              undone.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleToDelete(null)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}