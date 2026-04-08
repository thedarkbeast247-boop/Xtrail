import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ZoomIn, ZoomOut, Filter, MapPin, Star, Lock, Mountain, Bike, Navigation, Maximize2, X, Compass, Home as HomeIcon, Layers, Locate, TrendingUp, Flame } from 'lucide-react';
import { mockTrails, vehicleClasses, trailTypes, VehicleClass, TrailType, Trail } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ElevationProfile } from '../components/ElevationProfile';

type MapStyle = '3d-terrain' | 'topographic';

export function Home() {
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTrailType, setSelectedTrailType] = useState<TrailType | 'All'>('All');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<MapStyle>('3d-terrain');
  const [showGPS, setShowGPS] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: -30.5, lng: 25.5 }); // Mock GPS location in South Africa
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredTrails = mockTrails.filter(trail => {
    const matchesVehicle = selectedVehicleClass === 'All' || 
                           trail.vehicleClass.includes(selectedVehicleClass as VehicleClass);
    const matchesDifficulty = selectedDifficulty === 'All' || 
                              trail.difficulty === selectedDifficulty;
    const matchesTrailType = selectedTrailType === 'All' ||
                             trail.trailType === selectedTrailType;
    return matchesVehicle && matchesDifficulty && matchesTrailType;
  });

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
    setMapPosition({ x: 0, y: 0 });
  };

  // Pan/Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't start dragging if clicking on a trail path or SVG element
    if (target.closest('.trail-path') || target.closest('path') || target.tagName === 'path') {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setMapPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const target = e.target as HTMLElement;
      if (target.closest('.trail-path') || target.closest('path') || target.tagName === 'path') {
        return;
      }
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - mapPosition.x,
        y: e.touches[0].clientY - mapPosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    setMapPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Difficult': return 'bg-orange-500';
      case 'Expert': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getTrailStrokeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Moderate': return '#6366f1';
      case 'Difficult': return '#f97316';
      case 'Expert': return '#dc2626';
      default: return '#3b82f6';
    }
  };

  const getTrailOpacity = (trail: Trail) => {
    if (selectedTrail) {
      return trail.id === selectedTrail.id ? 1 : 0.3;
    }
    return 1;
  };

  // Convert lat/lng to pixel positions (normalized for South Africa)
  const getMarkerPosition = (lat: number, lng: number) => {
    // South Africa bounds approximately: lat -22 to -35, lng 16 to 33
    const latPercent = ((lat + 22) / -13) * 100;
    const lngPercent = ((lng - 16) / 17) * 100;
    
    return {
      top: `${Math.max(0, Math.min(100, latPercent))}%`,
      left: `${Math.max(0, Math.min(100, lngPercent))}%`
    };
  };

  const handleTrailClick = (trail: Trail, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrail(trail);
  };

  const handleClearFilters = () => {
    setSelectedVehicleClass('All');
    setSelectedDifficulty('All');
    setSelectedTrailType('All');
    setSelectedTrail(null);
  };

  const handleClosePanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrail(null);
  };

  const handleVehicleFilter = (vc: VehicleClass | 'All') => {
    setSelectedVehicleClass(vc);
    setSelectedTrail(null);
  };

  const handleDifficultyFilter = (diff: string) => {
    setSelectedDifficulty(diff);
    setSelectedTrail(null);
  };

  const handleTrailTypeFilter = (type: TrailType | 'All') => {
    setSelectedTrailType(type);
    setSelectedTrail(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Map Section */}
      <div className="relative h-[55vh] bg-neutral-900 overflow-hidden touch-none">
        {/* Map Container with Pan & Zoom */}
        <div 
          ref={mapRef}
          className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Map Background - Conditional based on style */}
          {mapStyle === '3d-terrain' ? (
            <img
              src="https://images.unsplash.com/photo-1669092557499-093cb88dc249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjB0ZXJyYWluJTIwM0QlMjB0b3BvZ3JhcGhpYyUyMHNhdGVsbGl0ZXxlbnwxfHx8fDE3NzQ3MDU5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="3D Satellite Terrain View"
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3BvZ3JhcGhpYyUyMG1hcCUyMGNvbnRvdXIlMjBsaW5lc3xlbnwxfHx8fDE3NzQ3MDU5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Topographic Map View"
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          )}

          {/* Heatmap Overlay for popular trails */}
          {showHeatmap && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <defs>
                <radialGradient id="heatmap-gradient">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
                </radialGradient>
              </defs>
              {mockTrails.map((trail) => {
                const pos = getMarkerPosition(trail.lat, trail.lng);
                const size = (trail.popularity || 5) * 5;
                return (
                  <circle
                    key={`heat-${trail.id}`}
                    cx={`${parseFloat(pos.left)}%`}
                    cy={`${parseFloat(pos.top)}%`}
                    r={size}
                    fill="url(#heatmap-gradient)"
                  />
                );
              })}
            </svg>
          )}
          
          {/* SVG Overlay for Trail Routes - Always visible */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Drop shadow for trails */}
              <filter id="trail-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {filteredTrails.map((trail) => (
              <g key={`route-${trail.id}`} filter="url(#trail-shadow)">
                {/* Trail Path outer white border (thicker) */}
                <path
                  d={trail.pathData}
                  fill="none"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={getTrailOpacity(trail)}
                  className="trail-path"
                  style={{ 
                    pointerEvents: 'stroke', 
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleTrailClick(trail, e as any)}
                />
                {/* Trail Path with difficulty color (inner) */}
                <path
                  d={trail.pathData}
                  fill="none"
                  stroke={getTrailStrokeColor(trail.difficulty)}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={getTrailOpacity(trail)}
                  className="trail-path"
                  style={{ 
                    pointerEvents: 'stroke', 
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleTrailClick(trail, e as any)}
                />
              </g>
            ))}
          </svg>

          {/* GPS User Location Indicator */}
          {showGPS && (
            <div
              className="absolute w-5 h-5 -ml-2.5 -mt-2.5 pointer-events-none z-40"
              style={getMarkerPosition(userLocation.lat, userLocation.lng)}
            >
              {/* Pulsing outer ring */}
              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
              {/* Middle ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-60"></div>
              {/* Inner dot */}
              <div className="absolute inset-1.5 rounded-full bg-blue-500 shadow-lg"></div>
            </div>
          )}

          {/* Trail Start & End Markers - Only for selected trail */}
          {selectedTrail && selectedTrail.startPoint && selectedTrail.endPoint && (
            <div>
              {/* Start Marker */}
              <div
                className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-4 border-white bg-emerald-500 shadow-2xl flex items-center justify-center pointer-events-none z-50 animate-pulse"
                style={getMarkerPosition(selectedTrail.startPoint.lat, selectedTrail.startPoint.lng)}
              >
                <div className="text-white text-sm font-bold">S</div>
              </div>

              {/* End Marker */}
              <div
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-4 border-white shadow-2xl flex items-center justify-center pointer-events-none z-50 animate-pulse ${getDifficultyColor(selectedTrail.difficulty)}`}
                style={getMarkerPosition(selectedTrail.endPoint.lat, selectedTrail.endPoint.lng)}
              >
                <div className="text-white text-sm font-bold">E</div>
              </div>
            </div>
          )}
        </div>

        {/* Map Controls - Right Side (like onX) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto z-40">
          <Button
            size="sm"
            onClick={() => setMapStyle(mapStyle === '3d-terrain' ? 'topographic' : '3d-terrain')}
            className={`border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg ${mapStyle === 'topographic' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white hover:bg-neutral-100 text-neutral-800'}`}
            title="Toggle Map Style"
          >
            <Layers className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowGPS(!showGPS)}
            className={`border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg ${showGPS ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white hover:bg-neutral-100 text-neutral-800'}`}
            title="Toggle GPS Location"
          >
            <Locate className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg ${showHeatmap ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-white hover:bg-neutral-100 text-neutral-800'}`}
            title="Toggle Heatmap"
          >
            <Flame className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            onClick={handleReset}
            className="bg-white hover:bg-neutral-100 border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg"
            title="Reset View"
          >
            <HomeIcon className="w-5 h-5 text-neutral-800" />
          </Button>
        </div>

        {/* Zoom Controls - Bottom Right */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 pointer-events-auto z-40">
          <Button
            size="sm"
            onClick={handleZoomIn}
            className="bg-white hover:bg-neutral-100 border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg"
          >
            <ZoomIn className="w-5 h-5 text-neutral-800" />
          </Button>
          <Button
            size="sm"
            onClick={handleZoomOut}
            className="bg-white hover:bg-neutral-100 border border-neutral-300 w-11 h-11 p-0 shadow-lg rounded-lg"
          >
            <ZoomOut className="w-5 h-5 text-neutral-800" />
          </Button>
        </div>

        {/* onX-style branding badge (top center) */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg pointer-events-none z-30">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-neutral-800" />
            <span className="text-neutral-900 font-bold text-sm">OFFROAD</span>
          </div>
        </div>

        {/* Bottom attribution bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-2 px-4 flex items-center justify-between pointer-events-auto z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600">Powered by Mapbox</span>
            <div className="w-px h-4 bg-neutral-300"></div>
            <Badge variant="outline" className="text-xs h-5 border-neutral-400 text-neutral-700">
              {mapStyle === '3d-terrain' ? '3D Terrain' : 'Topographic'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-900 font-medium">{filteredTrails.length} trails</span>
            <div className="w-px h-4 bg-neutral-300"></div>
            <span className="text-xs text-neutral-600">Zoom {zoomLevel.toFixed(1)}x</span>
          </div>
        </div>

        {/* Trail Info Side Panel - Slides in from left */}
        {selectedTrail && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl z-50 pointer-events-auto overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={handleClosePanel}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 shadow-lg"
              >
                <X className="w-5 h-5 text-neutral-900" />
              </button>

              {/* Trail Image */}
              <div className="relative h-48">
                <img 
                  src={selectedTrail.imageUrl}
                  alt={selectedTrail.name}
                  className="w-full h-full object-cover"
                />
                {selectedTrail.isPremium && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-neutral-900 px-2 py-1 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs font-bold">Premium</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-neutral-900 text-xl font-bold mb-4">{selectedTrail.name}</h2>
                
                {/* Overview Section */}
                <div className="mb-4">
                  <div className="border-b-2 border-orange-500 pb-1 mb-3">
                    <h3 className="text-neutral-900 text-sm font-bold">Overview</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-neutral-600 text-xs mb-1">Difficulty</div>
                      <div className="text-neutral-900 text-xl font-bold">{selectedTrail.difficulty}</div>
                    </div>
                    <div>
                      <div className="text-neutral-600 text-xs mb-1">Technical Rating</div>
                      <div className="text-neutral-900 text-xl font-bold">
                        {selectedTrail.difficulty === 'Easy' ? '3' : selectedTrail.difficulty === 'Moderate' ? '5' : selectedTrail.difficulty === 'Difficult' ? '7' : '9'}/10
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-neutral-600 text-xs mb-1">Distance</div>
                    <div className="text-neutral-900 text-xl font-bold">{selectedTrail.distance}mi</div>
                  </div>
                </div>

                {/* Accessible By Section */}
                <div className="mb-4">
                  <div className="text-neutral-900 font-bold mb-2">Accessible By</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrail.vehicleClass.map(vc => (
                      <div key={vc} className="flex items-center gap-2 bg-neutral-100 rounded px-3 py-2">
                        <Bike className="w-5 h-5 text-neutral-700" />
                        <span className="text-neutral-900 text-sm">{vc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-neutral-700 text-sm mb-4">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>{selectedTrail.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 pb-4 border-b border-neutral-200">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-neutral-900 text-lg font-bold">{selectedTrail.rating}</span>
                  <span className="text-neutral-600 text-sm">({selectedTrail.reviewCount} reviews)</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <div className="text-neutral-600 text-xs mb-1">Elevation Gain</div>
                    <div className="text-neutral-900 font-bold">{selectedTrail.elevation} ft</div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <div className="text-neutral-600 text-xs mb-1">Est. Time</div>
                    <div className="text-neutral-900 font-bold">{selectedTrail.duration} min</div>
                  </div>
                </div>

                {/* Elevation Profile */}
                {selectedTrail.elevationProfile && selectedTrail.elevationProfile.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-neutral-700" />
                      <h3 className="text-neutral-900 font-bold">Elevation Profile</h3>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3 h-40">
                      <ElevationProfile
                        data={selectedTrail.elevationProfile}
                        color={getTrailStrokeColor(selectedTrail.difficulty)}
                      />
                    </div>
                  </div>
                )}

                {/* Trail Type */}
                <div className="mb-4">
                  <Badge variant="outline" className="border-emerald-700 text-emerald-700 text-sm">
                    {selectedTrail.trailType}
                  </Badge>
                </div>

                {/* Action Button */}
                <Link to={`/trail/${selectedTrail.id}`} className="block">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="flex-1 bg-neutral-950 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-500" />
            <h2 className="text-white text-lg font-semibold">Filter Trails</h2>
          </div>

          {/* Vehicle Type Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300 font-medium">Vehicle Type</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              <Button
                variant={selectedVehicleClass === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVehicleFilter('All')}
                className={`flex-shrink-0 ${selectedVehicleClass === 'All' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'}`}
              >
                All
              </Button>
              {vehicleClasses.map(vc => (
                <Button
                  key={vc}
                  variant={selectedVehicleClass === vc ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVehicleFilter(vc)}
                  className={`flex-shrink-0 ${selectedVehicleClass === vc ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'}`}
                >
                  {vc}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Mountain className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300 font-medium">Difficulty Level</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {['All', 'Easy', 'Moderate', 'Difficult', 'Expert'].map(diff => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDifficultyFilter(diff)}
                  className={`flex-shrink-0 ${selectedDifficulty === diff ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'}`}
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          {/* Trail Type Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Bike className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300 font-medium">Trail Type</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              <Button
                variant={selectedTrailType === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTrailTypeFilter('All')}
                className={`flex-shrink-0 ${selectedTrailType === 'All' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'}`}
              >
                All
              </Button>
              {trailTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedTrailType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTrailTypeFilter(type)}
                  className={`flex-shrink-0 ${selectedTrailType === type ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'}`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-lg font-semibold">{filteredTrails.length} Trails Found</p>
                <p className="text-neutral-400 text-sm">Matching your filters</p>
              </div>
              {(selectedVehicleClass !== 'All' || selectedDifficulty !== 'All' || selectedTrailType !== 'All') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Trail List */}
          {filteredTrails.length > 0 && (
            <div className="space-y-3 pb-4">
              {filteredTrails.map(trail => (
                <button
                  key={trail.id}
                  onClick={() => setSelectedTrail(trail)}
                  className="block w-full text-left"
                >
                  <div className={`bg-neutral-900 border rounded-lg p-3 hover:border-emerald-600 transition-all duration-200 ${selectedTrail?.id === trail.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-neutral-800'}`}>
                    <div className="flex items-start gap-3">
                      <img 
                        src={trail.imageUrl}
                        alt={trail.name}
                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-white font-semibold truncate">{trail.name}</h4>
                          {trail.isPremium && (
                            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-neutral-400 text-xs mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trail.location}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${getDifficultyColor(trail.difficulty)} text-white border-0 text-xs`}>
                            {trail.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-xs">
                            {trail.trailType}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-white">{trail.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredTrails.length === 0 && (
            <div className="mt-8 text-center py-8">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-neutral-400 mb-2">No trails found</p>
              <p className="text-neutral-500 text-sm mb-4">Try adjusting your filters</p>
              <Button
                onClick={handleClearFilters}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
