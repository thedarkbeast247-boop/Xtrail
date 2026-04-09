import { useState } from 'react';
import { Award, TrendingUp, MapPin, Clock, Target, Star, Trophy, Zap, Lock } from 'lucide-react';
import { mockVehicleProfiles } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function Achievements() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(mockVehicleProfiles[0].id);

  const activeVehicle = mockVehicleProfiles.find(v => v.id === selectedVehicle) || mockVehicleProfiles[0];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Award,
      TrendingUp,
      MapPin,
      Clock,
      Target,
      Star,
      Trophy,
      Zap
    };
    return icons[iconName] || Award;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'distance': return '#ef4444';
      case 'trails': return '#10b981';
      case 'time': return '#f59e0b';
      case 'special': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const unlockedCount = activeVehicle.achievements.filter(a => a.unlocked).length;
  const totalCount = activeVehicle.achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <h1 className="text-white text-2xl mb-1">Achievements</h1>
        <p className="text-neutral-400 text-sm">Unlock badges & milestones</p>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Vehicle Selector */}
        <div>
          <label className="text-neutral-400 text-xs mb-1.5 block">Select Vehicle</label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              {mockVehicleProfiles.map(v => (
                <SelectItem key={v.id} value={v.id} className="text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }}></div>
                    {v.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Overview */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-white text-2xl mb-1">{unlockedCount}/{totalCount}</div>
              <div className="text-neutral-400 text-sm">Achievements Unlocked</div>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: activeVehicle.color + '20',
                border: `3px solid ${activeVehicle.color}`
              }}
            >
              <span className="text-white text-xl" style={{ color: activeVehicle.color }}>
                {progressPercent}%
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" style={{ backgroundColor: activeVehicle.color + '40' }} />
        </div>

        {/* Achievement Categories */}
        <div>
          <h2 className="text-white mb-3">All Achievements</h2>
          <div className="space-y-3">
            {activeVehicle.achievements.map((achievement) => {
              const Icon = getIconComponent(achievement.icon);
              const isLocked = !achievement.unlocked;

              return (
                <div
                  key={achievement.id}
                  className={`bg-neutral-900 border rounded-lg p-4 ${
                    isLocked
                      ? 'border-neutral-800 opacity-60'
                      : 'border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
                        isLocked ? 'bg-neutral-800' : ''
                      }`}
                      style={{
                        backgroundColor: isLocked ? '' : getCategoryColor(achievement.category) + '20'
                      }}
                    >
                      {isLocked ? (
                        <Lock className="w-7 h-7 text-neutral-600" />
                      ) : (
                        <Icon
                          className="w-7 h-7"
                          style={{ color: getCategoryColor(achievement.category) }}
                        />
                      )}
                      {!isLocked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`${isLocked ? 'text-neutral-500' : 'text-white'} mb-1`}>
                            {achievement.name}
                          </h3>
                          <p className="text-neutral-400 text-sm">{achievement.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                          style={{
                            borderColor: getCategoryColor(achievement.category),
                            color: getCategoryColor(achievement.category)
                          }}
                        >
                          {achievement.category}
                        </Badge>
                        {achievement.unlocked && achievement.unlockedDate && (
                          <span className="text-neutral-500 text-xs">
                            Unlocked {new Date(achievement.unlockedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Summary */}
        <div>
          <h2 className="text-white mb-3">By Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {['distance', 'trails', 'time', 'special'].map(category => {
              const categoryAchievements = activeVehicle.achievements.filter(a => a.category === category);
              const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;

              return (
                <div
                  key={category}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: getCategoryColor(category) + '20' }}
                  >
                    <Trophy className="w-5 h-5" style={{ color: getCategoryColor(category) }} />
                  </div>
                  <div className="text-white mb-1 capitalize">{category}</div>
                  <div className="text-neutral-400 text-sm">
                    {unlockedInCategory}/{categoryAchievements.length} unlocked
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
