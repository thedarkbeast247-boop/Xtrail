import { useState } from 'react';
import { TrendingUp, Calendar, Award, Target, Clock, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockVehicleProfiles } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const weeklyRidesData = [
  { day: 'Mon', rides: 0, hours: 0 },
  { day: 'Tue', rides: 0, hours: 0 },
  { day: 'Wed', rides: 1, hours: 2.5 },
  { day: 'Thu', rides: 0, hours: 0 },
  { day: 'Fri', rides: 2, hours: 4.2 },
  { day: 'Sat', rides: 3, hours: 6.8 },
  { day: 'Sun', rides: 2, hours: 5.1 }
];

const monthlyProgressData = [
  { month: 'Jan', distance: 45, trails: 3 },
  { month: 'Feb', distance: 67, trails: 5 },
  { month: 'Mar', distance: 89, trails: 7 },
  { month: 'Apr', distance: 52, trails: 4 }
];

export function ProgressDashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const activeVehicle = mockVehicleProfiles.find(v => v.id === selectedVehicle);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-neutral-400 text-xs">
              {entry.name}: <span className="text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <h1 className="text-white text-2xl mb-1">Progress Dashboard</h1>
        <p className="text-neutral-400 text-sm">Track your riding stats</p>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Vehicle & Time Range Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-neutral-400 text-xs mb-1.5 block">Vehicle</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                <SelectItem value="all" className="text-white">All Vehicles</SelectItem>
                {mockVehicleProfiles.map(v => (
                  <SelectItem key={v.id} value={v.id} className="text-white">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-neutral-400 text-xs mb-1.5 block">Time Range</label>
            <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
              <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                <SelectItem value="week" className="text-white">This Week</SelectItem>
                <SelectItem value="month" className="text-white">This Month</SelectItem>
                <SelectItem value="year" className="text-white">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-white mb-3">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <span className="text-neutral-400 text-sm">Total Distance</span>
              </div>
              <div className="text-white text-2xl">
                {activeVehicle ? activeVehicle.stats.distanceCovered.toFixed(0) : '642'}
              </div>
              <div className="text-neutral-500 text-xs">miles</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-neutral-400 text-sm">Riding Time</span>
              </div>
              <div className="text-white text-2xl">
                {activeVehicle ? activeVehicle.stats.totalHours.toFixed(1) : '161'}
              </div>
              <div className="text-neutral-500 text-xs">hours</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <span className="text-neutral-400 text-sm">Trails</span>
              </div>
              <div className="text-white text-2xl">
                {activeVehicle ? activeVehicle.stats.trailsCompleted : '25'}
              </div>
              <div className="text-neutral-500 text-xs">completed</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-neutral-400 text-sm">Trips</span>
              </div>
              <div className="text-white text-2xl">
                {activeVehicle ? activeVehicle.stats.tripsCompleted : '37'}
              </div>
              <div className="text-neutral-500 text-xs">total</div>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div>
          <h2 className="text-white mb-3">Weekly Activity</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRidesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" opacity={0.3} />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rides" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Progress Chart */}
        <div>
          <h2 className="text-white mb-3">Monthly Progress</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Personal Bests */}
        <div>
          <h2 className="text-white mb-3">Personal Bests</h2>
          <div className="space-y-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-white">Longest Ride</div>
                  <div className="text-neutral-500 text-sm">Distance record</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xl">42.3</div>
                <div className="text-neutral-500 text-xs">miles</div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-white">Most Active Day</div>
                  <div className="text-neutral-500 text-sm">Single day rides</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xl">5</div>
                <div className="text-neutral-500 text-xs">rides</div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-white">Longest Streak</div>
                  <div className="text-neutral-500 text-sm">Consecutive days</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xl">8</div>
                <div className="text-neutral-500 text-xs">days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Comparison */}
        {selectedVehicle === 'all' && (
          <div>
            <h2 className="text-white mb-3">Vehicle Comparison</h2>
            <div className="space-y-3">
              {mockVehicleProfiles.map(vehicle => (
                <div key={vehicle.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vehicle.color }}></div>
                      <span className="text-white">{vehicle.name}</span>
                    </div>
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
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-white text-lg">{vehicle.stats.tripsCompleted}</div>
                      <div className="text-neutral-500 text-xs">trips</div>
                    </div>
                    <div>
                      <div className="text-white text-lg">{vehicle.stats.totalHours.toFixed(1)}</div>
                      <div className="text-neutral-500 text-xs">hours</div>
                    </div>
                    <div>
                      <div className="text-white text-lg">{vehicle.stats.distanceCovered.toFixed(0)}</div>
                      <div className="text-neutral-500 text-xs">miles</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
