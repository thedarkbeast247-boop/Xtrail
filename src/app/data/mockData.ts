import { Trail, TrailType, VehicleClass } from "../types/trail";

export interface Ride {
  id: string;
  trailName: string;
  date: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  maxSpeed: number;
  elevation: number;
  vehicleClass: VehicleClass;
}

export interface User {
  name: string;
  email: string;
  memberSince: string;
  vehicleClasses: VehicleClass[];
  isPremium: boolean;
  ridesThisMonth: number;
  totalRides: number;
  totalDistance: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: "distance" | "trails" | "time" | "special";
}

export interface VehicleProfile {
  id: string;
  name: string;
  type: VehicleClass;
  imageUrl?: string;
  color: string;
  stats: {
    totalHours: number;
    tripsCompleted: number;
    trailsCompleted: number;
    distanceCovered: number;
    lastRideDate: string;
  };
  achievements: Achievement[];
  savedTrails: string[];
  completedTrails: string[];
}

export const mockUser: User = {
  name: "Alex Morgan",
  email: "alex@example.com",
  memberSince: "2024-01-15",
  vehicleClasses: ["ATV", "4x4", "Dual-Sport"],
  isPremium: false,
  ridesThisMonth: 3,
  totalRides: 24,
  totalDistance: 342.5,
};

export const mockVehicleProfiles: VehicleProfile[] = [
  {
    id: "1",
    name: "Honda 450X",
    type: "ATV",
    color: "#ef4444",
    stats: {
      totalHours: 47.5,
      tripsCompleted: 12,
      trailsCompleted: 8,
      distanceCovered: 156.3,
      lastRideDate: "2026-03-28",
    },
    achievements: [
      {
        id: "a1",
        name: "First Ride",
        description: "Complete your first ride",
        icon: "Award",
        unlocked: true,
        unlockedDate: "2026-01-20",
        category: "special",
      },
      {
        id: "a2",
        name: "100 Miles",
        description: "Ride 100 miles total",
        icon: "TrendingUp",
        unlocked: true,
        unlockedDate: "2026-03-15",
        category: "distance",
      },
      {
        id: "a3",
        name: "Trail Explorer",
        description: "Complete 5 different trails",
        icon: "MapPin",
        unlocked: true,
        unlockedDate: "2026-02-28",
        category: "trails",
      },
      {
        id: "a4",
        name: "50 Hours",
        description: "Ride for 50 total hours",
        icon: "Clock",
        unlocked: false,
        category: "time",
      },
    ],
    savedTrails: ["2", "4", "6"],
    completedTrails: ["1", "3", "5"],
  },
  {
    id: "2",
    name: "Toyota Tacoma",
    type: "4x4",
    color: "#3b82f6",
    stats: {
      totalHours: 89.2,
      tripsCompleted: 18,
      trailsCompleted: 12,
      distanceCovered: 387.8,
      lastRideDate: "2026-04-02",
    },
    achievements: [
      {
        id: "b1",
        name: "First Ride",
        description: "Complete your first ride",
        icon: "Award",
        unlocked: true,
        unlockedDate: "2025-12-10",
        category: "special",
      },
      {
        id: "b2",
        name: "100 Miles",
        description: "Ride 100 miles total",
        icon: "TrendingUp",
        unlocked: true,
        unlockedDate: "2026-01-05",
        category: "distance",
      },
      {
        id: "b3",
        name: "250 Miles",
        description: "Ride 250 miles total",
        icon: "Target",
        unlocked: true,
        unlockedDate: "2026-02-18",
        category: "distance",
      },
      {
        id: "b4",
        name: "Trail Master",
        description: "Complete 10 different trails",
        icon: "Star",
        unlocked: true,
        unlockedDate: "2026-03-25",
        category: "trails",
      },
      {
        id: "b5",
        name: "50 Hours",
        description: "Ride for 50 total hours",
        icon: "Clock",
        unlocked: true,
        unlockedDate: "2026-03-01",
        category: "time",
      },
      {
        id: "b6",
        name: "100 Hours",
        description: "Ride for 100 total hours",
        icon: "Trophy",
        unlocked: false,
        category: "time",
      },
    ],
    savedTrails: ["1", "3", "5"],
    completedTrails: ["2", "4", "6"],
  },
  {
    id: "3",
    name: "Yamaha WR250F",
    type: "Dual-Sport",
    color: "#8b5cf6",
    stats: {
      totalHours: 24.8,
      tripsCompleted: 7,
      trailsCompleted: 5,
      distanceCovered: 98.4,
      lastRideDate: "2026-03-18",
    },
    achievements: [
      {
        id: "c1",
        name: "First Ride",
        description: "Complete your first ride",
        icon: "Award",
        unlocked: true,
        unlockedDate: "2026-02-05",
        category: "special",
      },
      {
        id: "c2",
        name: "50 Miles",
        description: "Ride 50 miles total",
        icon: "TrendingUp",
        unlocked: true,
        unlockedDate: "2026-03-10",
        category: "distance",
      },
      {
        id: "c3",
        name: "100 Miles",
        description: "Ride 100 miles total",
        icon: "Target",
        unlocked: false,
        category: "distance",
      },
    ],
    savedTrails: ["2", "6"],
    completedTrails: ["1", "5"],
  },
];

export const mockTrails: Trail[] = [
  {
    id: "1",
    name: "Drakensberg Loop",
    vehicleClass: ["ATV", "UTV", "4x4"],
    difficulty: "Moderate",
    trailType: "Desert Trail",
    distance: 12.3,
    elevation: 850,
    duration: 90,
    imageUrl:
      "https://images.unsplash.com/photo-1768924467539-aaffb9e4df47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBVFYlMjBvZmYtcm9hZCUyMGRlc2VydCUyMHRyYWlsfGVufDF8fHx8MTc3NDQ2NTYwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Scenic desert trail with stunning canyon views. Moderate technical sections with sandy washes.",
    location: "Drakensberg, KwaZulu-Natal",
    province: "KwaZulu-Natal",
    country: "South Africa",
    rating: 4.7,
    reviewCount: 142,
    isPremium: false,
    lat: -29.0,
    lng: 29.3,
    startPoint: { lat: -29.0, lng: 29.2 },
    endPoint: { lat: -28.9, lng: 29.4 },
    pathData:
      "M 20,35 Q 30,25 40,30 T 60,28 T 80,35 T 100,30 L 110,40 Q 120,50 110,60",
    elevationProfile: [
      { distance: 0, elevation: 4200 },
      { distance: 2.5, elevation: 4450 },
      { distance: 5.0, elevation: 4600 },
      { distance: 7.5, elevation: 4900 },
      { distance: 10.0, elevation: 4750 },
      { distance: 12.3, elevation: 5050 },
    ],
    popularity: 8,
  },
  {
    id: "2",
    name: "Table Mountain Ridge",
    vehicleClass: ["Dual-Sport", "Motocross"],
    difficulty: "Difficult",
    trailType: "Hard Enduro",
    distance: 8.5,
    elevation: 1200,
    duration: 75,
    imageUrl:
      "https://images.unsplash.com/photo-1564912677462-6a1d6102473d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXJ0JTIwYmlrZSUyMG1vdW50YWluJTIwdHJhaWx8ZW58MXx8fHwxNzc0NDY1NjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Challenging mountain trail with tight switchbacks and rocky terrain. Experienced riders only.",
    location: "Cape Town, Western Cape",
    province: "Western Cape",
    country: "South Africa",
    rating: 4.9,
    reviewCount: 89,
    isPremium: true,
    isOfflineAvailable: true,
    lat: -33.9,
    lng: 18.4,
    startPoint: { lat: -33.95, lng: 18.35 },
    endPoint: { lat: -33.85, lng: 18.45 },
    pathData:
      "M 15,80 Q 20,70 25,75 T 35,72 Q 45,68 50,75 T 65,78 L 75,70 Q 85,65 90,70",
    elevationProfile: [
      { distance: 0, elevation: 3200 },
      { distance: 1.5, elevation: 3600 },
      { distance: 3.0, elevation: 3950 },
      { distance: 4.5, elevation: 4100 },
      { distance: 6.0, elevation: 4250 },
      { distance: 7.5, elevation: 4350 },
      { distance: 8.5, elevation: 4400 },
    ],
    popularity: 9,
  },
  {
    id: "3",
    name: "Garden Route Trail",
    vehicleClass: ["SUV", "4x4"],
    difficulty: "Easy",
    trailType: "Forest Trail",
    distance: 15.2,
    elevation: 450,
    duration: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1765519333785-892ba0e85e91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHw0eDQlMjBTVVYlMjBmb3Jlc3QlMjB0cmFpbHxlbnwxfHx8fDE3NzQ0NjU2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Family-friendly forest trail with beautiful scenery. Well-maintained gravel road suitable for beginners.",
    location: "Knysna, Western Cape",
    province: "Western Cape",
    country: "South Africa",
    rating: 4.5,
    reviewCount: 203,
    isPremium: false,
    lat: -34.0,
    lng: 23.0,
    startPoint: { lat: -34.05, lng: 22.95 },
    endPoint: { lat: -33.95, lng: 23.1 },
    pathData:
      "M 130,45 Q 140,40 150,45 T 170,48 Q 180,52 185,48 T 200,50 L 210,55",
    popularity: 10,
  },
  {
    id: "4",
    name: "Kruger Highland",
    vehicleClass: ["UTV", "ATV"],
    difficulty: "Expert",
    trailType: "Alpine",
    distance: 18.7,
    elevation: 2100,
    duration: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1771574207294-c17cbc21c783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVVFYlMjBvZmZyb2FkJTIwYWR2ZW50dXJlfGVufDF8fHx8MTc3NDQ2NTYwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Epic alpine trail with extreme elevation changes and technical obstacles. Full-day adventure for experts.",
    location: "Kruger National Park, Mpumalanga",
    province: "Mpumalanga",
    country: "South Africa",
    rating: 5.0,
    reviewCount: 67,
    isPremium: true,
    isOfflineAvailable: true,
    lat: -24.0,
    lng: 31.5,
    startPoint: { lat: -24.1, lng: 31.4 },
    endPoint: { lat: -23.9, lng: 31.6 },
    pathData:
      "M 220,20 Q 230,15 240,18 T 260,22 Q 270,28 275,25 T 290,30 L 300,35 Q 310,40 315,37",
    popularity: 7,
  },
  {
    id: "5",
    name: "Karoo Desert Run",
    vehicleClass: ["4x4", "SUV", "UTV"],
    difficulty: "Moderate",
    trailType: "Technical Rock",
    distance: 21.4,
    elevation: 950,
    duration: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1767642600695-73fb58edc36a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmYtcm9hZCUyMHZlaGljbGUlMjBjYW55b258ZW58MXx8fHwxNzc0NDY1NjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Spectacular canyon trail with river crossings and red rock formations. Great for photography.",
    location: "Karoo, Northern Cape",
    province: "Northern Cape",
    country: "South Africa",
    rating: 4.8,
    reviewCount: 156,
    isPremium: false,
    lat: -32.0,
    lng: 22.5,
    startPoint: { lat: -32.1, lng: 22.4 },
    endPoint: { lat: -31.9, lng: 22.6 },
    pathData:
      "M 140,85 Q 150,75 160,80 T 180,82 Q 190,88 195,82 T 210,85 L 220,90 Q 230,95 235,92",
    popularity: 6,
  },
  {
    id: "6",
    name: "Mpumalanga Highlands",
    vehicleClass: ["Dual-Sport", "ATV"],
    difficulty: "Moderate",
    trailType: "Light Enduro",
    distance: 10.1,
    elevation: 600,
    duration: 80,
    imageUrl:
      "https://images.unsplash.com/photo-1770130636832-bff00259121c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwdHJhaWwlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzc0NDY1NjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Remote wilderness trail with creek crossings and muddy sections. Great for adventure seekers.",
    location: "Blyde River Canyon, Mpumalanga",
    province: "Mpumalanga",
    country: "South Africa",
    rating: 4.6,
    reviewCount: 94,
    isPremium: true,
    isOfflineAvailable: true,
    lat: -24.5,
    lng: 30.8,
    startPoint: { lat: -24.6, lng: 30.75 },
    endPoint: { lat: -24.4, lng: 30.85 },
    pathData:
      "M 245,55 Q 255,50 265,53 T 285,56 Q 295,60 300,56 T 315,58 L 325,63",
    popularity: 5,
  },
];

export const mockRecentRides: Ride[] = [
  {
    id: "1",
    trailName: "Desert Canyon Run",
    date: "2026-03-20",
    distance: 12.3,
    duration: 85,
    avgSpeed: 8.7,
    maxSpeed: 24.3,
    elevation: 850,
    vehicleClass: "ATV",
  },
  {
    id: "2",
    trailName: "Forest Loop",
    date: "2026-03-15",
    distance: 15.2,
    duration: 110,
    avgSpeed: 8.3,
    maxSpeed: 18.5,
    elevation: 450,
    vehicleClass: "4x4",
  },
  {
    id: "3",
    trailName: "Backwoods Trail",
    date: "2026-03-08",
    distance: 10.1,
    duration: 95,
    avgSpeed: 6.4,
    maxSpeed: 15.2,
    elevation: 600,
    vehicleClass: "Dual-Sport",
  },
];

export const vehicleClasses: VehicleClass[] = [
  "ATV",
  "Motocross",
  "Dual-Sport",
  "SUV",
  "4x4",
  "UTV",
];

export const trailTypes: TrailType[] = [
  "Motocross",
  "Light Enduro",
  "Hard Enduro",
  "Technical Rock",
  "Sand Dunes",
  "Forest Trail",
  "Desert Trail",
  "Alpine",
];