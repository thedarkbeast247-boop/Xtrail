import { useRef, useState } from "react";
import { Plus, Edit, Trash2, Star, Calendar } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
import type { VehicleType } from "../types/vehicle";

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
  const {
  vehicles,
  activeVehicleId,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setActiveVehicleId,
} = useVehicles();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "" as "" | VehicleType,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    hours: 0,
    mileage: 0,
    notes: "",
    image: "",
    bannerImage: "",
    color: "#ef4444",
  });

  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState({
    name: "",
    type: "" as "" | VehicleType,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    hours: 0,
    mileage: 0,
    notes: "",
    image: "",
    bannerImage: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
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
      alert("Please upload an image file.");
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
      alert("Please upload an image file.");
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
      alert("Please upload an image file.");
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
    mileage: number;
    notes?: string;
    image?: string;
    bannerImage?: string;
  }) => {
    setEditingVehicleId(vehicle.id);
    setEditVehicle({
      name: vehicle.name,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      hours: vehicle.hours,
      mileage: vehicle.mileage,
      notes: vehicle.notes ?? "",
      image: vehicle.image ?? "",
      bannerImage: vehicle.bannerImage ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleAddVehicle = () => {
    if (!newVehicle.name.trim() || !newVehicle.type || !newVehicle.brand.trim() || !newVehicle.model.trim()) {
      alert("Please fill in vehicle name, type, brand, and model.");
      return;
    }

    addVehicle({
      name: newVehicle.name.trim(),
      type: newVehicle.type,
      brand: newVehicle.brand.trim(),
      model: newVehicle.model.trim(),
      year: Number(newVehicle.year),
      hours: Number(newVehicle.hours),
      mileage: Number(newVehicle.mileage),
      notes: newVehicle.notes.trim(),
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
      mileage: 0,
      notes: "",
      color: "#ef4444",
      image: "",
      bannerImage: "",
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
      alert("Please fill in vehicle name, type, brand, and model.");
      return;
    }

    updateVehicle(editingVehicleId, {
      name: editVehicle.name.trim(),
      type: editVehicle.type,
      brand: editVehicle.brand.trim(),
      model: editVehicle.model.trim(),
      year: Number(editVehicle.year),
      hours: Number(editVehicle.hours),
      mileage: Number(editVehicle.mileage),
      notes: editVehicle.notes.trim(),
      image: editVehicle.image,
      bannerImage: editVehicle.bannerImage,
    });

    setIsEditModalOpen(false);
    setEditingVehicleId(null);
  };

  const totalVehicles = vehicles.length;
  const totalMiles = vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0);
  const totalHours = vehicles.reduce((sum, vehicle) => sum + vehicle.hours, 0);

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
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
                <Plus className="w-4 h-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Vehicle</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
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
                  <div>
                    <Label className="text-neutral-300">Hours</Label>
                    <Input
                      type="number"
                      value={newVehicle.hours}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          hours: Number(e.target.value),
                        })
                      }
                      className="bg-neutral-800 border-neutral-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-300">Mileage</Label>
                    <Input
                      type="number"
                      value={newVehicle.mileage}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
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
                    placeholder="Any notes about this vehicle"
                    value={newVehicle.notes}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, notes: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>
                
                {/* Image upload */}
                <div>
                  <Label className="text-neutral-300">Vehicle Photo</Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Banner Image</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
                    />

                    {newVehicle.bannerImage && (
                      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                        <img
                          src={newVehicle.bannerImage}
                          alt="Banner preview"
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-neutral-700 text-neutral-300"
                    >
                      Upload Photo
                    </Button>

                    {newVehicle.image && (
                      <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                        <img
                          src={newVehicle.image}
                          alt="Vehicle preview"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-300">Color Theme</Label>
                  <div className="grid grid-cols-6 gap-2 mt-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setNewVehicle({ ...newVehicle, color: color.value })
                        }
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          newVehicle.color === color.value
                            ? "border-white scale-110"
                            : "border-neutral-700 hover:border-neutral-600"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddVehicle}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Add Vehicle
                </Button>
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
            <div className="text-neutral-400 text-xs">Miles</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{totalHours.toFixed(0)}</div>
            <div className="text-neutral-400 text-xs">Hours</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
              <h3 className="text-white text-lg mb-2">No vehicles yet</h3>
              <p className="text-neutral-400 text-sm mb-4">
                Add your first vehicle to start building your garage.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Add Your First Vehicle
              </Button>
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const color = "#ef4444";
              const isActive = activeVehicleId === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  className={`bg-neutral-900 border rounded-lg p-5 transition-colors ${
                    isActive ? "border-red-500" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-neutral-700 bg-neutral-800">
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
                            <Badge className="bg-red-600 hover:bg-red-600">
                              Active
                            </Badge>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: color, color }}
                        >
                          {vehicle.type}
                        </Badge>

                        <p className="text-neutral-400 text-sm mt-2">
                          {vehicle.brand} {vehicle.model} • {vehicle.year}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() => deleteVehicle(vehicle.id)}
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
                      <div className="text-neutral-500 text-xs">miles</div>
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
                        onClick={() => handleOpenEditVehicle(vehicle)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-neutral-700 text-neutral-300 h-7 text-xs"
                          onClick={() => setActiveVehicleId(vehicle.id)}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set Active
                        </Button>
                      )}

                      <Link to={`/garage/${vehicle.id}`} onClick={() => setActiveVehicleId(vehicle.id)}>
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
            })
          )}
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="outline"
          className="w-full mt-4 border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6 border-dashed"
        >
          <Plus className="w-5 h-5" />
          Add Another Vehicle
        </Button>
      </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Vehicle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                <Label className="text-neutral-300">Hours</Label>
                <Input
                  type="number"
                  value={editVehicle.hours}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      hours: Number(e.target.value),
                    })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white mt-1"
                />
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
              <Label className="text-neutral-300">Vehicle Photo</Label>

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                className="hidden"
              />

              {/* Vehicle Image Upload */}
              <div className="mt-2 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-full border-neutral-700 text-neutral-300"
                >
                  Upload New Photo
                </Button>

                {editVehicle.image && (
                  <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                    <img
                      src={editVehicle.image}
                      alt="Vehicle preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Banner Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditBannerImageUpload}
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
                />

                {editVehicle.bannerImage && (
                  <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                    <img
                      src={editVehicle.bannerImage}
                      alt="Banner preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveEditVehicle}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}