import { useState } from 'react';
import { Settings, LogOut, Calendar, Crown, Plus, MapPin, Bookmark, CheckCircle2, Clock, TrendingUp, Award, Target, Star, Trophy, Wrench, Users, ChevronRight, BarChart3, Car } from 'lucide-react';
import { Link } from 'react-router';
import { mockUser, mockVehicleProfiles, mockTrails, VehicleProfile } from '../data/mockData';
import { Button } from '../components/ui/button';
import { VehicleSelector } from '../components/VehicleSelector';

export function Profile() {
  const [activeVehicle, setActiveVehicle] = useState<VehicleProfile>(mockVehicleProfiles[0]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Award,
      TrendingUp,
      MapPin,
      Clock,
      Target,
      Star,
      Trophy
    };
    return icons[iconName] || Award;
  };

  const savedTrails = mockTrails.filter(t => activeVehicle.savedTrails.includes(t.id));
  const completedTrails = mockTrails.filter(t => activeVehicle.completedTrails.includes(t.id));
  const completionPercentage = Math.round((activeVehicle.completedTrails.length / mockTrails.length) * 100);

  const nextAchievement = activeVehicle.achievements.find(a => !a.unlocked);
  const unlockedCount = activeVehicle.achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xl">
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-white text-xl mb-0.5">{mockUser.name}</h1>
              <p className="text-neutral-400 text-sm">{mockUser.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500 text-xs">
                  Since {formatDate(mockUser.memberSince)}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-neutral-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Membership Status */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`w-4 h-4 ${mockUser.isPremium ? 'text-amber-500' : 'text-neutral-500'}`} />
            <span className="text-white text-sm">
              {mockUser.isPremium ? 'Premium Member' : 'Free Plan'}
            </span>
          </div>
          {!mockUser.isPremium && (
            <Link to="/subscription">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-xs">
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Feature Buttons Row */}
        <div>
          <h2 className="text-white mb-3">Quick Access</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <Link to="/service-log" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-white text-xs text-center">Service Log</div>
              </div>
            </Link>

            <Link to="/friends" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-white text-xs text-center">Friends</div>
              </div>
            </Link>

            <Link to="/" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-white text-xs text-center">Trails</div>
              </div>
            </Link>

            <Link to="/progress" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-white text-xs text-center">Progress</div>
              </div>
            </Link>

            <Link to="/achievements" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-white text-xs text-center">Achievements</div>
              </div>
            </Link>

            <Link to="/garage" className="flex-shrink-0">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 w-24 hover:border-neutral-700 transition-colors">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Car className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-white text-xs text-center">Garage</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Vehicle Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white">Active Vehicle</h2>
            <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-400 h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
          <VehicleSelector
            vehicles={mockVehicleProfiles}
            activeVehicle={activeVehicle}
            onVehicleChange={setActiveVehicle}
          />
          <div
            className="mt-3 h-1.5 rounded-full"
            style={{ backgroundColor: activeVehicle.color + '33' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: activeVehicle.color
              }}
            />
          </div>
          <p className="text-neutral-500 text-xs mt-1.5">
            {activeVehicle.completedTrails.length} of {mockTrails.length} trails completed ({completionPercentage}%)
          </p>
        </div>

        {/* Key Stats */}
        <div>
          <h2 className="text-white mb-3">Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="text-3xl mb-1" style={{ color: activeVehicle.color }}>
                {activeVehicle.stats.totalHours.toFixed(1)}
              </div>
              <div className="text-neutral-400 text-xs">Total Hours</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="text-3xl mb-1" style={{ color: activeVehicle.color }}>
                {activeVehicle.stats.tripsCompleted}
              </div>
              <div className="text-neutral-400 text-xs">Trips Completed</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="text-3xl mb-1" style={{ color: activeVehicle.color }}>
                {activeVehicle.stats.trailsCompleted}
              </div>
              <div className="text-neutral-400 text-xs">Trails Completed</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="text-3xl mb-1" style={{ color: activeVehicle.color }}>
                {activeVehicle.stats.distanceCovered.toFixed(0)}
              </div>
              <div className="text-neutral-400 text-xs">Miles Covered</div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <Clock className="w-4 h-4" />
                Last Ride
              </div>
              <div className="text-white">{formatDate(activeVehicle.stats.lastRideDate)}</div>
            </div>
          </div>
        </div>

        {/* Next Achievement */}
        {nextAchievement && (
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                {(() => {
                  const Icon = getIconComponent(nextAchievement.icon);
                  return <Icon className="w-6 h-6 text-neutral-500" />;
                })()}
              </div>
              <div className="flex-1">
                <div className="text-neutral-400 text-xs mb-1">Next Achievement</div>
                <div className="text-white mb-0.5">{nextAchievement.name}</div>
                <div className="text-neutral-500 text-xs">{nextAchievement.description}</div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Trails */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-neutral-400" />
              <h2 className="text-white">Saved Trails</h2>
            </div>
            <span className="text-neutral-500 text-sm">{savedTrails.length}</span>
          </div>

          {savedTrails.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-lg p-6 text-center">
              <Bookmark className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">No saved trails yet</p>
              <Link to="/">
                <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-400 mt-3 text-xs">
                  Browse Trails
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedTrails.map(trail => (
                <Link key={trail.id} to={`/trail/${trail.id}`}>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center gap-3 hover:border-neutral-700 transition-colors">
                    <div
                      className="w-12 h-12 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${trail.imageUrl})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm mb-0.5 truncate">{trail.name}</div>
                      <div className="text-neutral-500 text-xs">{trail.distance} mi · {trail.difficulty}</div>
                    </div>
                    <MapPin className="w-4 h-4 text-neutral-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Completed Trails */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: activeVehicle.color }} />
              <h2 className="text-white">Completed Trails</h2>
            </div>
            <span className="text-neutral-500 text-sm">{completedTrails.length}</span>
          </div>

          {completedTrails.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-lg p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">No completed trails yet</p>
              <Link to="/record">
                <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-400 mt-3 text-xs">
                  Record a Ride
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {completedTrails.map(trail => (
                <Link key={trail.id} to={`/trail/${trail.id}`}>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center gap-3 hover:border-neutral-700 transition-colors">
                    <div
                      className="w-12 h-12 rounded-lg bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${trail.imageUrl})` }}
                    >
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" style={{ color: activeVehicle.color }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm mb-0.5 truncate">{trail.name}</div>
                      <div className="text-neutral-500 text-xs">{trail.distance} mi · {trail.difficulty}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white">Achievements</h2>
            <span className="text-neutral-500 text-sm">
              {unlockedCount}/{activeVehicle.achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {activeVehicle.achievements.map(achievement => {
              const Icon = getIconComponent(achievement.icon);
              return (
                <div
                  key={achievement.id}
                  className={`bg-neutral-900 border rounded-lg p-3 text-center ${
                    achievement.unlocked
                      ? 'border-neutral-700'
                      : 'border-neutral-800 opacity-40'
                  }`}
                >
                  <Icon
                    className="w-7 h-7 mx-auto mb-1.5"
                    style={{
                      color: achievement.unlocked ? activeVehicle.color : '#525252'
                    }}
                  />
                  <div className="text-white text-xs leading-tight">{achievement.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-2 pt-4 border-t border-neutral-800">
          <Button variant="outline" className="w-full justify-start border-neutral-800 text-neutral-300 h-11">
            <Settings className="w-4 h-4 mr-3" />
            Account Settings
          </Button>

          <Button variant="outline" className="w-full justify-start border-red-800 text-red-500 hover:bg-red-950 h-11">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
