import { useState } from 'react';
import { Plus, Wrench, Calendar, DollarSign, Clock, Filter, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockVehicleProfiles } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

interface ServiceEntry {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  cost: number;
  mileage: number;
  notes: string;
}

const mockServiceHistory: ServiceEntry[] = [
  {
    id: '1',
    vehicleId: '1',
    type: 'Oil Change',
    date: '2026-03-15',
    cost: 65,
    mileage: 145,
    notes: 'Regular maintenance - used synthetic 10W-40'
  },
  {
    id: '2',
    vehicleId: '1',
    type: 'Air Filter',
    date: '2026-02-20',
    cost: 35,
    mileage: 120,
    notes: 'Replaced with K&N filter'
  },
  {
    id: '3',
    vehicleId: '2',
    type: 'Tire Rotation',
    date: '2026-03-28',
    cost: 80,
    mileage: 375,
    notes: 'All four tires rotated, pressure checked'
  },
  {
    id: '4',
    vehicleId: '2',
    type: 'Brake Pads',
    date: '2026-01-10',
    cost: 250,
    mileage: 320,
    notes: 'Front brake pads replaced'
  }
];

const serviceTypes = [
  'Oil Change',
  'Air Filter',
  'Chain Maintenance',
  'Tire Change',
  'Tire Rotation',
  'Brake Pads',
  'Spark Plugs',
  'Coolant Flush',
  'Suspension',
  'Other'
];

export function ServiceLog() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    vehicleId: '',
    type: '',
    date: '',
    cost: '',
    mileage: '',
    notes: ''
  });

  const filteredServices = selectedVehicle === 'all'
    ? mockServiceHistory
    : mockServiceHistory.filter(s => s.vehicleId === selectedVehicle);

  const getVehicleName = (vehicleId: string) => {
    const vehicle = mockVehicleProfiles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown';
  };

  const getVehicleColor = (vehicleId: string) => {
    const vehicle = mockVehicleProfiles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.color : '#10b981';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalCost = filteredServices.reduce((sum, service) => sum + service.cost, 0);

  const handleAddService = () => {
    // In real app, this would save to database
    console.log('Adding service:', newService);
    setIsAddModalOpen(false);
    setNewService({
      vehicleId: '',
      type: '',
      date: '',
      cost: '',
      mileage: '',
      notes: ''
    });
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl mb-1">Service Log</h1>
            <p className="text-neutral-400 text-sm">Track maintenance & repairs</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
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
                  <Select value={newService.vehicleId} onValueChange={(val) => setNewService({...newService, vehicleId: val})}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {mockVehicleProfiles.map(v => (
                        <SelectItem key={v.id} value={v.id} className="text-white">
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-neutral-300">Service Type</Label>
                  <Select value={newService.type} onValueChange={(val) => setNewService({...newService, type: val})}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      {serviceTypes.map(type => (
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
                    onChange={(e) => setNewService({...newService, date: e.target.value})}
                    className="bg-neutral-800 border-neutral-700 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-neutral-300">Cost ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newService.cost}
                      onChange={(e) => setNewService({...newService, cost: e.target.value})}
                      className="bg-neutral-800 border-neutral-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-300">Mileage</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newService.mileage}
                      onChange={(e) => setNewService({...newService, mileage: e.target.value})}
                      className="bg-neutral-800 border-neutral-700 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-300">Notes</Label>
                  <Textarea
                    placeholder="Add any notes..."
                    value={newService.notes}
                    onChange={(e) => setNewService({...newService, notes: e.target.value})}
                    className="bg-neutral-800 border-neutral-700 text-white mt-1 min-h-20"
                  />
                </div>

                <Button onClick={handleAddService} className="w-full bg-red-600 hover:bg-red-700">
                  Save Service Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">{filteredServices.length}</div>
            <div className="text-neutral-400 text-xs">Services</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">${totalCost}</div>
            <div className="text-neutral-400 text-xs">Total Cost</div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
            <div className="text-white text-xl mb-0.5">
              {filteredServices.length > 0 ? Math.round(totalCost / filteredServices.length) : 0}
            </div>
            <div className="text-neutral-400 text-xs">Avg Cost</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-300 text-sm">Filter by Vehicle</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <Button
              variant={selectedVehicle === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVehicle('all')}
              className={`flex-shrink-0 ${selectedVehicle === 'all' ? 'bg-red-600 hover:bg-red-700' : 'border-neutral-700 text-neutral-300'}`}
            >
              All Vehicles
            </Button>
            {mockVehicleProfiles.map(vehicle => (
              <Button
                key={vehicle.id}
                variant={selectedVehicle === vehicle.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`flex-shrink-0 gap-2 ${selectedVehicle === vehicle.id ? 'bg-red-600 hover:bg-red-700' : 'border-neutral-700 text-neutral-300'}`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: vehicle.color }}></div>
                {vehicle.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Service History Timeline */}
        <div>
          <h2 className="text-white mb-3">Service History</h2>
          {filteredServices.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-lg p-8 text-center">
              <Wrench className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 mb-2">No service records yet</p>
              <p className="text-neutral-500 text-sm mb-4">Start tracking your maintenance</p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                variant="outline"
                className="border-neutral-700 text-neutral-300"
              >
                Add First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServices.map((service, index) => (
                <div
                  key={service.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getVehicleColor(service.vehicleId) + '20' }}
                      >
                        <Wrench className="w-5 h-5" style={{ color: getVehicleColor(service.vehicleId) }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white mb-1">{service.type}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs border-neutral-700"
                            style={{
                              borderColor: getVehicleColor(service.vehicleId),
                              color: getVehicleColor(service.vehicleId)
                            }}
                          >
                            {getVehicleName(service.vehicleId)}
                          </Badge>
                        </div>
                        <p className="text-neutral-400 text-sm">{service.notes}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-400 text-xs">{formatDate(service.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-400 text-xs">${service.cost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-400 text-xs">{service.mileage}mi</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
