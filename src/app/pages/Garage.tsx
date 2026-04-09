import { useState } from 'react';
import { Plus, Edit, Trash2, Star, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockVehicleProfiles } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function Garage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: '',
    color: '#ef4444'
  });

  const handleAddVehicle = () => {
    console.log('Adding vehicle:', newVehicle);
    setIsAddModalOpen(false);
    setNewVehicle({ name: '', type: '', color: '#ef4444' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const colorOptions = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' }
  ];

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
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
                    placeholder="e.g., Honda 450X"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-neutral-300">Vehicle Type</Label>
                  <Select value={newVehicle.type} onValueChange={(val) => setNewVehicle({...newVehicle, type: val})}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {['ATV', 'Motocross', 'Dual-Sport', 'SUV', '4x4', 'UTV'].map(type => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-300">Color Theme</Label>
                  <div className="grid grid-cols-6 gap-2 mt-1">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewVehicle({...newVehicle, color: color.value})}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          newVehicle.color === color.value
                            ? 'border-white scale-110'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddVehicle} className="w-full bg-red-600 hover:bg-red-700">
                  Add Vehicle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{mockVehicleProfiles.length}</div>
            <div className="text-neutral-400 text-xs">Vehicles</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {mockVehicleProfiles.reduce((sum, v) => sum + v.stats.tripsCompleted, 0)}
            </div>
            <div className="text-neutral-400 text-xs">Total Trips</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {mockVehicleProfiles.reduce((sum, v) => sum + v.stats.totalHours, 0).toFixed(0)}
            </div>
            <div className="text-neutral-400 text-xs">Total Hours</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Vehicle Cards */}
        <div className="space-y-4">
          {mockVehicleProfiles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
                    style={{
                      backgroundColor: vehicle.color + '30',
                      border: `3px solid ${vehicle.color}`
                    }}
                  >
                    {vehicle.name.split(' ')[0][0]}{vehicle.name.split(' ')[1]?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-lg mb-1">{vehicle.name}</h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: vehicle.color,
                        color: vehicle.color
                      }}
                    >
                      {vehicle.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-neutral-400 text-xs">Trail Completion</span>
                  <span className="text-white text-xs">
                    {vehicle.completedTrails.length} / 6 trails
                  </span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(vehicle.completedTrails.length / 6) * 100}%`,
                      backgroundColor: vehicle.color
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-white text-lg mb-0.5">{vehicle.stats.totalHours.toFixed(0)}</div>
                  <div className="text-neutral-500 text-xs">hours</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-lg mb-0.5">{vehicle.stats.tripsCompleted}</div>
                  <div className="text-neutral-500 text-xs">trips</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-lg mb-0.5">{vehicle.stats.trailsCompleted}</div>
                  <div className="text-neutral-500 text-xs">trails</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-lg mb-0.5">{vehicle.stats.distanceCovered.toFixed(0)}</div>
                  <div className="text-neutral-500 text-xs">miles</div>
                </div>
              </div>

              {/* Last Ride */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Last ride: {formatDate(vehicle.stats.lastRideDate)}</span>
                </div>
                <Link to="/profile">
                  <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 h-7 text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add More */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="outline"
          className="w-full mt-4 border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6 border-dashed"
        >
          <Plus className="w-5 h-5" />
          Add Another Vehicle
        </Button>
      </div>
    </div>
  );
}
