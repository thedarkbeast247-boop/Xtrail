import { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, MapPin, TrendingUp, Clock, Gauge, Locate, Mountain, User } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockVehicleProfiles } from '../data/mockData';
import { useNotification } from '../context/NotificationContext';

export function RecordRide() {
  const { showNotification } = useNotification();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [pathPoints, setPathPoints] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof window.setInterval> | null = null;

    if (isRecording && !isPaused) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);
        setDistance(prev => prev + 0.05);
        setCurrentSpeed(Math.random() * 20 + 5);
        setAvgSpeed(prev => (prev + (Math.random() * 20 + 5)) / 2);
        setElevation(prev => prev + Math.random() * 2);

        // Add new GPS point to path (simulate movement)
        setPathPoints(prev => {
          const lastPoint = prev[prev.length - 1] || { x: 50, y: 50 };
          const newX = Math.min(95, Math.max(5, lastPoint.x + (Math.random() - 0.5) * 5));
          const newY = Math.min(95, Math.max(5, lastPoint.y + (Math.random() - 0.5) * 5));
          return [...prev, { x: newX, y: newY }];
        });
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const handleStart = () => {
    if (!selectedVehicle) {
      showNotification({
        title: "Vehicle needed",
        message: "Please select a vehicle type before starting the ride.",
        variant: "warning",
      });

      return;
    }
    setIsRecording(true);
    setIsPaused(false);
    setPathPoints([{ x: 50, y: 50 }]); // Start at center
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (window.confirm('Stop recording? Your ride will be saved.')) {
      setIsRecording(false);
      setIsPaused(false);
      // Reset stats
      setTimeout(() => {
        setDuration(0);
        setDistance(0);
        setAvgSpeed(0);
        setCurrentSpeed(0);
        setElevation(0);
        setPathPoints([]);
      }, 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-950 to-neutral-950 px-4 py-6">
        <h1 className="text-white text-2xl mb-2">Record Ride</h1>
        <p className="text-neutral-400 text-sm">Track your off-road adventure</p>
      </div>

      <div className="px-4 py-6">
        {/* Vehicle Selection */}
        {!isRecording && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm">Select Your Vehicle</label>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-emerald-500 h-7 text-xs">
                  <User className="w-3.5 h-3.5 mr-1" />
                  Manage
                </Button>
              </Link>
            </div>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                <SelectValue placeholder="Choose your vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                {mockVehicleProfiles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: vehicle.color }}
                      ></div>
                      <span>{vehicle.name}</span>
                      <span className="text-neutral-500 text-xs">({vehicle.type})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Live Map View */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg mb-6 h-80 relative overflow-hidden">
          {/* Map Background */}
          <img
            src="https://images.unsplash.com/photo-1669092557499-093cb88dc249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjB0ZXJyYWluJTIwM0QlMjB0b3BvZ3JhcGhpYyUyMHNhdGVsbGl0ZXxlbnwxfHx8fDE3NzQ3MDU5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="3D Terrain Map"
            className="w-full h-full object-cover opacity-40"
          />

          {/* GPS Path Overlay */}
          {pathPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="1"/>
                </linearGradient>
              </defs>
              <polyline
                points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* White outer glow */}
              <polyline
                points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
            </svg>
          )}

          {/* Current GPS Location Marker */}
          {isRecording && pathPoints.length > 0 && (
            <div
              className="absolute w-5 h-5 -ml-2.5 -mt-2.5 pointer-events-none z-10 transition-all duration-1000"
              style={{
                left: `${pathPoints[pathPoints.length - 1]?.x}%`,
                top: `${pathPoints[pathPoints.length - 1]?.y}%`
              }}
            >
              <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 opacity-60"></div>
              <div className="absolute inset-1.5 rounded-full bg-emerald-500 shadow-lg"></div>
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
            {isRecording && (
              <Badge className="bg-red-600 text-white animate-pulse flex items-center gap-1.5 px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                Recording
              </Badge>
            )}
            {!isRecording && pathPoints.length === 0 && (
              <div className="bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 rounded-lg px-3 py-2 flex items-center gap-2">
                <Locate className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-400 text-sm">Ready to record</span>
              </div>
            )}
            <div className="ml-auto bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-emerald-500" />
              <span className="text-white text-sm">{elevation.toFixed(0)} ft</span>
            </div>
          </div>

          {/* Distance Overlay */}
          {isRecording && (
            <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700 rounded-lg px-3 py-2">
              <div className="text-emerald-500 text-2xl font-bold">{distance.toFixed(2)}</div>
              <div className="text-neutral-400 text-xs">miles</div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="text-neutral-400 text-sm">Duration</span>
            </div>
            <div className="text-white text-2xl">{formatTime(duration)}</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-neutral-400 text-sm">Distance</span>
            </div>
            <div className="text-white text-2xl">{distance.toFixed(2)}</div>
            <div className="text-neutral-500 text-xs">miles</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-emerald-500" />
              <span className="text-neutral-400 text-sm">Current Speed</span>
            </div>
            <div className="text-white text-2xl">{currentSpeed.toFixed(1)}</div>
            <div className="text-neutral-500 text-xs">mph</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-emerald-500" />
              <span className="text-neutral-400 text-sm">Avg Speed</span>
            </div>
            <div className="text-white text-2xl">{avgSpeed.toFixed(1)}</div>
            <div className="text-neutral-500 text-xs">mph</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-neutral-400 text-sm">Elevation Gain</span>
              <div className="text-white text-xl">{elevation.toFixed(0)} ft</div>
            </div>
            {selectedVehicle && (() => {
              const vehicle = mockVehicleProfiles.find(v => v.id === selectedVehicle);
              return vehicle ? (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2"
                  style={{
                    borderColor: vehicle.color,
                    backgroundColor: vehicle.color + '20'
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: vehicle.color }}
                  ></div>
                  <span className="text-white text-sm">{vehicle.name}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isRecording ? (
            <Button 
              onClick={handleStart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg"
              disabled={!selectedVehicle}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button 
                onClick={handlePause}
                className={`w-full h-14 text-lg ${isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-6 h-6 mr-2" />
                    Pause
                  </>
                )}
              </Button>

              <Button 
                onClick={handleStop}
                variant="outline"
                className="w-full border-red-700 text-red-500 hover:bg-red-950 h-14 text-lg"
              >
                <StopCircle className="w-6 h-6 mr-2" />
                Stop & Save
              </Button>
            </>
          )}
        </div>

        {/* Free Tier Limit Notice */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Rides This Month</span>
            <span className="text-emerald-500">3 / 5</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-neutral-400 text-xs mt-2">
            Upgrade to Premium for unlimited ride tracking
          </p>
        </div>
      </div>
    </div>
  );
}
