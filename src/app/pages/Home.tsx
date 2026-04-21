import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ZoomIn, ZoomOut, Filter, MapPin, Star, Lock, Mountain, Bike, Navigation, Maximize2, X, Compass, Home as HomeIcon, Layers, Locate, TrendingUp, Flame, ChevronDown } from 'lucide-react';
import { mockTrails, vehicleClasses, trailTypes } from "../data/mockData";
import type { VehicleClass, TrailType, Trail } from "../types/trail";
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ElevationProfile } from '../components/ElevationProfile';
import TrailCard from "../components/TrailCard";
import { useVehicles } from "../context/VehicleContext";
import { type SavedRide } from "../utils/rideStats";
import { type CompletedTrail } from "../types/completedTrail";
import { type SavedTrail } from "../types/savedTrail";

type MapStyle = '3d-terrain' | 'topographic';
type DiscoverFeed = 'nearby' | 'popular';
const discoveryAreas = [
  "Near me",
  "Western Cape",
  "KwaZulu-Natal",
  "Mpumalanga",
  "Northern Cape",
] as const;

type DiscoveryArea = (typeof discoveryAreas)[number];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeVehicle } = useVehicles();
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
  const [discoverFeed, setDiscoverFeed] = useState<DiscoverFeed>('nearby');
  const [selectedArea, setSelectedArea] = useState<DiscoveryArea>("Near me");
  const [showTrailLoadedBanner, setShowTrailLoadedBanner] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false);
  const [rideElapsedSeconds, setRideElapsedSeconds] = useState(0);
  const [isRidePaused, setIsRidePaused] = useState(false);
  const [activeRideTrail, setActiveRideTrail] = useState<Trail | null>(null);
  const [rideDistanceKm, setRideDistanceKm] = useState(0);
  const [rideAverageSpeedKmh, setRideAverageSpeedKmh] = useState(0);
  const [showRideSummary, setShowRideSummary] = useState(false);
  const [lastRideSummary, setLastRideSummary] = useState<Omit<SavedRide, "id"> | null>(null);
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);
  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);

  type TrailFilter = "all" | "saved" | "completed";

  const [activeFilter, setActiveFilter] = useState<TrailFilter>("all");
  const [savedTrailIds, setSavedTrailIds] = useState<string[]>([]);
  const [completedTrailIds, setCompletedTrailIds] = useState<string[]>([]);

  type FilterSection = "status" | "vehicle" | "difficulty" | "trailType" | null;

  const [openFilterSection, setOpenFilterSection] = useState<FilterSection>(null);

  type DiscoverySection = "mode" | "area" | null;

  const [openDiscoverySection, setOpenDiscoverySection] = useState<DiscoverySection>(null);

  const handleSaveRideSummary = () => {
    if (!lastRideSummary) return;

    const newRide: SavedRide = {
      id: crypto.randomUUID(),
      ...lastRideSummary,
    };

    setSavedRides((prev) => [newRide, ...prev]);

    if (newRide.trailId) {
      try {
        const storedCompletedTrails = localStorage.getItem("xtrail-completed-trails");

        const parsedCompletedTrails: CompletedTrail[] = storedCompletedTrails
          ? JSON.parse(storedCompletedTrails)
          : [];

        const newCompletedTrail: CompletedTrail = {
          id: crypto.randomUUID(),
          trailId: newRide.trailId,
          trailName: newRide.trailName,
          completedAt: newRide.finishedAt,
          rideId: newRide.id,
        };

        localStorage.setItem(
          "xtrail-completed-trails",
          JSON.stringify([newCompletedTrail, ...parsedCompletedTrails])
        );
      } catch (error) {
        console.error("Failed to save completed trail", error);
      }
    }

    setShowRideSummary(false);
    setLastRideSummary(null);
  };

  const handleDiscardRideSummary = () => {
    setShowRideSummary(false);
    setLastRideSummary(null);
  };
  
  const formatRideFinishedAt = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString();
  };

  const toggleDiscoverySection = (
    section: Exclude<DiscoverySection, null>
  ) => {
    setOpenDiscoverySection((prev) => (prev === section ? null : section));
  };

  const getDiscoverFeedLabel = () => {
    return discoverFeed === "nearby" ? "Nearby" : "Popular";
  };

  const getSelectedAreaLabel = () => {
    return selectedArea;
  };

  const getDiscoveryCardClass = (section: Exclude<DiscoverySection, null>) => {
    const isOpen = openDiscoverySection === section;

    const sectionStyles = {
      mode: isOpen
        ? "border-orange-400/50 bg-orange-500/10"
        : "border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800",
      area: isOpen
        ? "border-emerald-400/50 bg-emerald-500/10"
        : "border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800",
    };

    return `w-full min-h-[80px] rounded-2xl border p-3 text-left transition-all duration-200 ${sectionStyles[section]}`;
  };

  const handleDiscoverFeedChange = (feed: DiscoverFeed) => {
    setDiscoverFeed(feed);
    setOpenDiscoverySection(null);
  };

  const handleDiscoveryAreaChange = (area: DiscoveryArea) => {
    setSelectedArea(area);
    setOpenDiscoverySection(null);
  };

  // Effect 1 for handling "startTrail" query param
  useEffect(() => {
  const startTrailId = searchParams.get("startTrail");

  // If no trail was passed → do nothing
  if (!startTrailId) return;

  // Find the trail in your mock data
  const matchedTrail = mockTrails.find(
    (trail) => trail.id === startTrailId
  );

  if (!matchedTrail) return;

  // ✅ Select the trail (this opens the panel)
  setSelectedTrail(matchedTrail);

  // ✅ Selected trail (this shows the "Trail loaded" banner)
  setShowTrailLoadedBanner(true);

  // ✅ Switch to nearby mode
  setDiscoverFeed("nearby");

  // ✅ Set the correct area based on the trail
  setSelectedArea(
    discoveryAreas.includes(matchedTrail.province as DiscoveryArea)
      ? (matchedTrail.province as DiscoveryArea)
      : "Near me"
  );

  // ✅ Reset map position
  setMapPosition({ x: 0, y: 0 });

  // ✅ Slight zoom in
  setZoomLevel(1.8);

  // ✅ Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // ✅ Remove the query param after using it
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);
    next.delete("startTrail");
    return next;
  });
}, [searchParams, setSearchParams]);
// Effect 1 for handling "startTrail" query param (End of effect 1)

  // Effect 2 for hiding the banner after 2.5 seconds
  useEffect(() => {
    if (!showTrailLoadedBanner) return;

    const timeout = window.setTimeout(() => {
      setShowTrailLoadedBanner(false);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [showTrailLoadedBanner]);
  // Effect 2 for hiding the banner after 2.5 seconds (End of effect 2)

  // Effect 3 for simulating ride timer(start of the timer effect)
  useEffect(() => {
    if (!isRideActive || isRidePaused) return;

    const interval = window.setInterval(() => {
      setRideElapsedSeconds((prevSeconds) => {
        const nextSeconds = prevSeconds + 1;

        setRideDistanceKm((prevDistance) => {
          const nextDistance = Number((prevDistance + 0.005).toFixed(2));
          const elapsedHours = nextSeconds / 3600;
          const nextAverageSpeed =
            elapsedHours > 0 ? Number((nextDistance / elapsedHours).toFixed(1)) : 0;

          setRideAverageSpeedKmh(nextAverageSpeed);
          return nextDistance;
        });

        return nextSeconds;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRideActive, isRidePaused]);
  // Effect 3 for simulating ride timer(end of the timer effect)
  
  // Effect 4 for loading/saving rides to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("xtrail-saved-rides");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as SavedRide[];
      setSavedRides(parsed);
    } catch (error) {
      console.error("Failed to load saved rides", error);
    }
  }, []);

  // Effect 5 for loading completed trails from localStorage(start of effect 5)
  useEffect(() => {
    const storedCompletedTrails = localStorage.getItem("xtrail-completed-trails");

    if (!storedCompletedTrails) {
      setCompletedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedCompletedTrails) as CompletedTrail[];
      setCompletedTrails(parsed);
    } catch (error) {
      console.error("Failed to load completed trails", error);
      setCompletedTrails([]);
    }
  }, []);
  // Effect 5 for loading completed trails from localStorage(end of effect 5)

  // Effect 6 for loading/saving saved trails to localStorage (start of effect 6)
  useEffect(() => {
    const storedSavedTrails = localStorage.getItem("xtrail-saved-trails");

    if (!storedSavedTrails) {
      setSavedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedSavedTrails) as SavedTrail[];
      setSavedTrails(parsed);
    } catch (error) {
      console.error("Failed to load saved trails", error);
      setSavedTrails([]);
    }
  }, []);

  useEffect(() => {
    const loadTrailStates = () => {
      try {
        const savedRaw = localStorage.getItem("xtrail-saved-trails");
        const completedRaw = localStorage.getItem("xtrail-completed-trails");

        const saved = savedRaw ? JSON.parse(savedRaw) : [];
        const completed = completedRaw ? JSON.parse(completedRaw) : [];

        const savedIds = saved.map((item: any) => item.trailId);
        const completedIds = completed.map((item: any) => item.trailId);

        setSavedTrailIds(savedIds);
        setCompletedTrailIds(completedIds);
      } catch (error) {
        console.error("Failed to load saved/completed trail state:", error);
        setSavedTrailIds([]);
        setCompletedTrailIds([]);
      }
    };

    loadTrailStates();

    window.addEventListener("focus", loadTrailStates);

    return () => {
      window.removeEventListener("focus", loadTrailStates);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("xtrail-saved-rides", JSON.stringify(savedRides));
  }, [savedRides]);
  // Effect 4 for loading/saving rides to localStorage (End of effect 4)

  //Timer formatting function
  const formatRideTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };
  //Timer formatting function

  const handleBeginRide = () => {
    if (!selectedTrail) return;

    setActiveRideTrail(selectedTrail);
    setRideElapsedSeconds(0);
    setRideDistanceKm(0);
    setRideAverageSpeedKmh(0);
    setIsRidePaused(false);
    setIsRideActive(true);
  };

  const handlePauseResumeRide = () => {
    setIsRidePaused((prev) => !prev);
  };

  const handleStopRide = () => {
    if (activeRideTrail) {
      setLastRideSummary({
        trailId: activeRideTrail.id,
        trailName: activeRideTrail.name,
        trailImageUrl: activeRideTrail.imageUrl,
        durationSeconds: rideElapsedSeconds,
        distanceKm: rideDistanceKm,
        avgSpeedKmh: rideAverageSpeedKmh,
        finishedAt: new Date().toISOString(),
        vehicleId: activeVehicle?.id,
        vehicleName: activeVehicle?.name,
        vehicleType: activeVehicle?.type,
        coverImageUrl: activeRideTrail.imageUrl,
        galleryImages: [],
        routePathData: activeRideTrail.pathData,
      });

      setShowRideSummary(true);
    }

    setIsRideActive(false);
    setIsRidePaused(false);
    setActiveRideTrail(null);
    setRideElapsedSeconds(0);
    setRideDistanceKm(0);
    setRideAverageSpeedKmh(0);
  };

  const filteredTrails = mockTrails.filter((trail) => {
    const matchesVehicle =
      selectedVehicleClass === "All" ||
      trail.vehicleClass.includes(selectedVehicleClass as VehicleClass);

    const matchesDifficulty =
      selectedDifficulty === "All" ||
      trail.difficulty === selectedDifficulty;

    const matchesTrailType =
      selectedTrailType === "All" ||
      trail.trailType === selectedTrailType;

    const matchesSaved =
      activeFilter !== "saved" || savedTrailIds.includes(trail.id);

    const matchesCompleted =
      activeFilter !== "completed" || completedTrailIds.includes(trail.id);

    return (
      matchesVehicle &&
      matchesDifficulty &&
      matchesTrailType &&
      matchesSaved &&
      matchesCompleted
    );
  });

  const nearbyTrails =
  selectedArea === "Near me"
    ? filteredTrails
    : filteredTrails.filter((trail) => trail.province === selectedArea);

  const displayedTrails =
  discoverFeed === "popular"
    ? [...filteredTrails].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    : nearbyTrails;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
  };

  const visibleTrails = displayedTrails;

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
    setActiveFilter("all");
    setSelectedVehicleClass("All");
    setSelectedDifficulty("All");
    setSelectedTrailType("All");
    setSelectedTrail(null);
  };

  const handleClosePanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrail(null);
  };

  const handleVehicleFilter = (vc: VehicleClass | 'All') => {
    setSelectedVehicleClass(vc);
    setSelectedTrail(null);
    setOpenFilterSection(null);
  };

  const handleDifficultyFilter = (diff: string) => {
    setSelectedDifficulty(diff);
    setSelectedTrail(null);
    setOpenFilterSection(null);
  };

  const handleTrailTypeFilter = (type: TrailType | 'All') => {
    setSelectedTrailType(type);
    setSelectedTrail(null);
    setOpenFilterSection(null);
  };

  const toggleFilterSection = (
    section: Exclude<FilterSection, null>
  ) => {
    setOpenFilterSection((prev) => (prev === section ? null : section));
  };
  //Last filter handler

  const getActiveFilterLabel = () => {
    switch (activeFilter) {
      case "saved":
        return "Saved";
      case "completed":
        return "Completed";
      default:
        return "All";
    }
  };

  const getVehicleFilterLabel = () => {
    return selectedVehicleClass === "All" ? "All" : selectedVehicleClass;
  };

  const getDifficultyFilterLabel = () => {
    return selectedDifficulty === "All" ? "All" : selectedDifficulty;
  };

  const getTrailTypeFilterLabel = () => {
    return selectedTrailType === "All" ? "All" : selectedTrailType;
  };

  const savedTrailsCount = savedTrailIds.length;
  const completedTrailsCount = completedTrailIds.length;

  const getFilterCardClass = (section: Exclude<FilterSection, null>) => {
    const isOpen = openFilterSection === section;

    const sectionStyles = {
      status: isOpen
        ? "border-orange-400/60 bg-gradient-to-br from-orange-500/20 to-orange-400/10 shadow-[0_12px_30px_rgba(249,115,22,0.12)]"
        : "border-orange-500/20 bg-gradient-to-br from-orange-500/12 to-orange-400/5 hover:from-orange-500/18 hover:to-orange-400/10",
      vehicle: isOpen
        ? "border-emerald-400/60 bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
        : "border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 to-emerald-400/5 hover:from-emerald-500/18 hover:to-emerald-400/10",
      difficulty: isOpen
        ? "border-sky-400/60 bg-gradient-to-br from-sky-500/20 to-sky-400/10 shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
        : "border-sky-500/20 bg-gradient-to-br from-sky-500/12 to-sky-400/5 hover:from-sky-500/18 hover:to-sky-400/10",
      trailType: isOpen
        ? "border-violet-400/60 bg-gradient-to-br from-violet-500/20 to-violet-400/10 shadow-[0_12px_30px_rgba(139,92,246,0.12)]"
        : "border-violet-500/20 bg-gradient-to-br from-violet-500/12 to-violet-400/5 hover:from-violet-500/18 hover:to-violet-400/10",
    };

    return `w-full min-h-[96px] rounded-3xl border p-4 text-left transition-all duration-200 ${sectionStyles[section]}`;
  };

  const isTrailSaved = (trailId: string) => {
    return savedTrails.some(
      (savedTrail) => savedTrail.trailId === trailId
    );
  };

  const isTrailCompleted = (trailId: string) => {
    return completedTrails.some(
      (completedTrail) => completedTrail.trailId === trailId
    );
  };

  const getFilterButtonClass = (isActive: boolean, activeColor = "emerald") => {
    const activeClasses =
      activeColor === "orange"
        ? "bg-orange-500 text-white border-orange-500 shadow-md"
        : "bg-emerald-600 text-white border-emerald-600 shadow-md";

    return `h-11 rounded-2xl px-4 text-sm font-semibold border transition-all whitespace-nowrap ${
      isActive
        ? activeClasses
        : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800"
    }`;
  };

  // Main render, Main Return
  return (
    <div className="relative min-h-screen bg-neutral-950 flex flex-col">
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
            <span className="text-neutral-900 font-bold text-sm">XTRAIL</span>
          </div>
        </div>
        
        {/* Trail Loaded Banner */}
        {showTrailLoadedBanner && selectedTrail && (
          <div className="absolute top-20 left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-xs -translate-x-1/2 rounded-3xl border border-orange-500/20 bg-neutral-900/90 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-400" />

              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-white">Trail loaded</p>
                <p className="mt-1 text-xs leading-5 text-neutral-300">
                  {selectedTrail.name} is ready to explore.
                </p>
              </div>
            </div>
          </div>
        )}

        {isRideActive && activeRideTrail && (
          <div className="fixed bottom-35 left-1/2 z-[50] w-full max-w-[440px] -translate-x-1/2 px-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/78 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isRidePaused ? "bg-yellow-400" : "bg-emerald-400"
                      }`}
                    />
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      {isRidePaused ? "Ride Paused" : "Ride Active"}
                    </p>
                  </div>

                  <h3 className="mt-2 truncate text-sm font-semibold text-white">
                    {activeRideTrail.name}
                  </h3>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                    {formatRideTime(rideElapsedSeconds)}
                  </p>

                  <div className="mt-2 flex items-center gap-4 text-xs text-neutral-300">
                    <div>
                      <span className="text-neutral-500">Distance</span>{" "}
                      <span className="font-semibold text-white">{rideDistanceKm.toFixed(2)} km</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Avg Speed</span>{" "}
                      <span className="font-semibold text-white">{rideAverageSpeedKmh.toFixed(1)} km/h</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handlePauseResumeRide}
                    className={`min-w-[92px] rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      isRidePaused
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-yellow-500 text-black hover:bg-yellow-400"
                    }`}
                  >
                    {isRidePaused ? "Resume" : "Pause"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStopRide}
                    className="min-w-[92px] rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                  >
                    Stop Ride
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <span className="text-xs text-neutral-900 font-medium">{visibleTrails.length} trails</span>
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
              
              <div className="p-4 pb-40">
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
                
                {/* Begin ride Button */}
                <Button
                  onClick={handleBeginRide}
                  className="mb-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-base"
                >
                  Begin Ride
                </Button>

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
        <div className="p-4 pb-44">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-500" />
            <h2 className="text-white text-lg font-semibold">Filter Trails</h2>
          </div>

          {/* Trail Status Filter */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => toggleFilterSection("status")}
              className={getFilterCardClass("status")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-orange-300" />
                  <span className="text-sm font-semibold text-white">Trail Status</span>
                  {openFilterSection === "status" && (
                    <span className="h-2 w-2 rounded-full bg-orange-300" />
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-orange-100 transition-transform ${
                    openFilterSection === "status" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <p className="mt-4 text-xs text-orange-100/90">
                {getActiveFilterLabel()}
              </p>
            </button>

            <button
              type="button"
              onClick={() => toggleFilterSection("vehicle")}
              className={getFilterCardClass("vehicle")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm font-semibold text-white">Vehicle Type</span>
                  {openFilterSection === "vehicle" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-emerald-100 transition-transform ${
                    openFilterSection === "vehicle" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <p className="mt-4 text-xs text-emerald-100/90">
                {getVehicleFilterLabel()}
              </p>
            </button>

            <button
              type="button"
              onClick={() => toggleFilterSection("difficulty")}
              className={getFilterCardClass("difficulty")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-sky-300" />
                  <span className="text-sm font-semibold text-white">Difficulty</span>
                  {openFilterSection === "difficulty" && (
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-sky-100 transition-transform ${
                    openFilterSection === "difficulty" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <p className="mt-4 text-xs text-sky-100/90">
                {getDifficultyFilterLabel()}
              </p>
            </button>

            <button
              type="button"
              onClick={() => toggleFilterSection("trailType")}
              className={getFilterCardClass("trailType")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bike className="h-4 w-4 text-violet-300" />
                  <span className="text-sm font-semibold text-white">Trail Type</span>
                  {openFilterSection === "trailType" && (
                    <span className="h-2 w-2 rounded-full bg-violet-300" />
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-violet-100 transition-transform ${
                    openFilterSection === "trailType" ? "rotate-180" : ""
                  }`}
                />
              </div>
              <p className="mt-4 text-xs text-violet-100/90">
                {getTrailTypeFilterLabel()}
              </p>
            </button>
          </div>

          {openFilterSection && (
            <div className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              {openFilterSection === "status" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("all");
                      setOpenFilterSection(null);
                    }}
                    className={getFilterButtonClass(activeFilter === "all", "orange")}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("saved");
                      setOpenFilterSection(null);
                    }}
                    className={getFilterButtonClass(activeFilter === "saved", "orange")}
                  >
                    Saved
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("completed");
                      setOpenFilterSection(null);
                    }}
                    className={getFilterButtonClass(activeFilter === "completed", "orange")}
                  >
                    Completed
                  </button>
                </div>
              )}

              {openFilterSection === "vehicle" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleVehicleFilter("All")}
                    className={getFilterButtonClass(selectedVehicleClass === "All")}
                  >
                    All
                  </button>

                  {vehicleClasses.map((vc) => (
                    <button
                      key={vc}
                      type="button"
                      onClick={() => handleVehicleFilter(vc)}
                      className={getFilterButtonClass(selectedVehicleClass === vc)}
                    >
                      {vc}
                    </button>
                  ))}
                </div>
              )}

              {openFilterSection === "difficulty" && (
                <div className="flex flex-wrap gap-2">
                  {["All", "Easy", "Moderate", "Difficult", "Expert"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleDifficultyFilter(diff)}
                      className={getFilterButtonClass(selectedDifficulty === diff)}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              )}

              {openFilterSection === "trailType" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleTrailTypeFilter("All")}
                    className={getFilterButtonClass(selectedTrailType === "All")}
                  >
                    All
                  </button>

                  {trailTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTrailTypeFilter(type)}
                      className={getFilterButtonClass(selectedTrailType === type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white text-lg font-semibold">{visibleTrails.length} Trails Found</p>
                <p className="text-neutral-400 text-sm">
                  {activeFilter === "saved" && "Saved trails ready to revisit"}
                  {activeFilter === "completed" && "Completed trails from your progress"}
                  {activeFilter === "all" && "Public trails ready to explore"}
                </p>
              </div>

              {(activeFilter !== "all" ||
                selectedVehicleClass !== "All" ||
                selectedDifficulty !== "All" ||
                selectedTrailType !== "All") && (
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
          
          {/* Trails near you */}
          <div className="mb-6">
            <div className="mt-6 border-t border-neutral-800 pt-3 mb-4">
              <h3 className="text-lg font-semibold text-white">
                Trails near you
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                {discoverFeed === "nearby"
                  ? `Exploring trails in ${selectedArea}.`
                  : "See the most popular community trails right now."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => toggleDiscoverySection("mode")}
                className={getDiscoveryCardClass("mode")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-orange-300" />
                    <span className="text-sm font-semibold text-white">Explore Mode</span>
                    {openDiscoverySection === "mode" && (
                      <span className="h-2 w-2 rounded-full bg-orange-300" />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-orange-100 transition-transform ${
                      openDiscoverySection === "mode" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <p className="mt-3 text-xs text-neutral-300">
                  {getDiscoverFeedLabel()}
                </p>
              </button>

              <button
                type="button"
                onClick={() => toggleDiscoverySection("area")}
                className={getDiscoveryCardClass("area")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm font-semibold text-white">Area</span>
                    {openDiscoverySection === "area" && (
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-emerald-100 transition-transform ${
                      openDiscoverySection === "area" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <p className="mt-4 text-xs text-emerald-100/90">
                  {getSelectedAreaLabel()}
                </p>
              </button>
            </div>

            {openDiscoverySection && (
              <div className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                {openDiscoverySection === "mode" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDiscoverFeedChange("nearby")}
                      className={getFilterButtonClass(discoverFeed === "nearby", "orange")}
                    >
                      Nearby
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDiscoverFeedChange("popular")}
                      className={getFilterButtonClass(discoverFeed === "popular", "orange")}
                    >
                      Popular
                    </button>
                  </div>
                )}

                {openDiscoverySection === "area" && (
                  <div className="flex flex-wrap gap-2">
                    {discoveryAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleDiscoveryAreaChange(area)}
                        className={getFilterButtonClass(selectedArea === area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Trail Cards */}
          {visibleTrails.length > 0 && (
            <div className="grid grid-cols-1 gap-4 pb-4">
              {visibleTrails.map((trail: Trail) => (
                <div
                  key={trail.id}
                  onClick={() => setSelectedTrail(trail)}
                  className="cursor-pointer"
                >
                  <TrailCard
                    trail={trail}
                    isCompleted={isTrailCompleted(trail.id)}
                    isSaved={isTrailSaved(trail.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {visibleTrails.length === 0 && (
            <div className="mt-8 text-center py-8">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-neutral-400 mb-2">No trails found in this view</p>
              <p className="text-neutral-500 text-sm mb-4">
                {discoverFeed === "nearby"
                  ? `Showing trails for ${selectedArea}.`
                  : "See the most popular community trails right now."}
              </p>
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

      {/* Summary Block */}
      {showRideSummary && lastRideSummary && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-5 py-8">
          <div className="w-full max-w-[340px] rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Ride complete
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight leading-tight text-white">
              {lastRideSummary.trailName}
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              Finished {formatRideFinishedAt(lastRideSummary.finishedAt)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">Duration</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {formatRideTime(lastRideSummary.durationSeconds)}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">Distance</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {lastRideSummary.distanceKm.toFixed(2)} km
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">Avg Speed</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {lastRideSummary.avgSpeedKmh.toFixed(1)} km/h
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">Trail</p>
                <p className="mt-2 text-sm font-bold text-white">
                  {lastRideSummary.trailName}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDiscardRideSummary}
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleSaveRideSummary}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Save Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
