import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Star, Clock, TrendingUp, Mountain, Navigation, Lock, Heart, Share2, Download } from 'lucide-react';
import { mockTrails } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export function TrailDetail() {
  const { id } = useParams();
  const trail = mockTrails.find(t => t.id === id);

  if (!trail) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Trail not found</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header Image */}
      <div className="relative h-64">
        <img 
          src={trail.imageUrl} 
          alt={trail.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button size="icon" className="bg-neutral-900/80 hover:bg-neutral-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        {trail.isPremium && (
          <div className="absolute top-4 right-4 bg-amber-500 text-neutral-900 px-3 py-2 rounded-md flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Premium Trail</span>
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <Badge 
            className={`
              ${trail.difficulty === 'Easy' ? 'bg-green-600' : ''}
              ${trail.difficulty === 'Moderate' ? 'bg-yellow-600' : ''}
              ${trail.difficulty === 'Difficult' ? 'bg-orange-600' : ''}
              ${trail.difficulty === 'Expert' ? 'bg-red-600' : ''}
              text-white
            `}
          >
            {trail.difficulty}
          </Badge>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Title & Location */}
        <h1 className="text-white text-3xl mb-2">{trail.name}</h1>
        <div className="flex items-center gap-2 text-neutral-400 mb-4">
          <MapPin className="w-5 h-5" />
          <span>{trail.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="text-white text-lg">{trail.rating}</span>
          </div>
          <span className="text-neutral-400">({trail.reviewCount} reviews)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Navigation className="w-4 h-4 mr-2" />
            Start Navigation
          </Button>
          <Button variant="outline" size="icon" className="border-neutral-700">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="border-neutral-700">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-white text-lg">{trail.distance}</div>
            <div className="text-neutral-400 text-xs">Miles</div>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-center">
            <Mountain className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-white text-lg">{trail.elevation}</div>
            <div className="text-neutral-400 text-xs">Elevation (ft)</div>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-center">
            <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-white text-lg">{trail.duration}</div>
            <div className="text-neutral-400 text-xs">Minutes</div>
          </div>
        </div>

        {/* Vehicle Classes */}
        <div className="mb-6">
          <h2 className="text-white text-lg mb-3">Suitable Vehicles</h2>
          <div className="flex flex-wrap gap-2">
            {trail.vehicleClass.map(vc => (
              <Badge key={vc} variant="outline" className="border-emerald-700 text-emerald-400">
                {vc}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-white text-lg mb-3">About This Trail</h2>
          <p className="text-neutral-300 leading-relaxed">{trail.description}</p>
        </div>

        {/* Offline Download (Premium) */}
        {trail.isPremium && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-white">Offline Maps Available</div>
                  <div className="text-neutral-400 text-sm">Download for offline use</div>
                </div>
              </div>
              {trail.isOfflineAvailable ? (
                <Badge className="bg-emerald-600">Downloaded</Badge>
              ) : (
                <Button size="sm" variant="outline" className="border-emerald-700 text-emerald-400">
                  Download
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-6">
          <h2 className="text-white text-lg mb-3">Recent Reviews</h2>
          <div className="space-y-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-white text-sm">
                  JD
                </div>
                <div>
                  <div className="text-white text-sm">John Doe</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  </div>
                </div>
              </div>
              <p className="text-neutral-300 text-sm">
                Amazing trail! The views are incredible and the technical sections are challenging but fun. Highly recommend for experienced riders.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm">
                  SM
                </div>
                <div>
                  <div className="text-white text-sm">Sarah Miller</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <Star className="w-3 h-3 text-neutral-600" />
                  </div>
                </div>
              </div>
              <p className="text-neutral-300 text-sm">
                Great trail with beautiful scenery. A few rough spots but overall very enjoyable. Perfect for a weekend adventure.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {trail.isPremium && (
          <div className="bg-gradient-to-r from-amber-900 to-amber-950 border border-amber-700 rounded-lg p-6 text-center">
            <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-white text-xl mb-2">Premium Feature</h3>
            <p className="text-neutral-300 mb-4">
              Upgrade to Premium to access this trail with offline maps, detailed route planning, and more.
            </p>
            <Link to="/subscription">
              <Button className="bg-amber-500 hover:bg-amber-600 text-neutral-900">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
