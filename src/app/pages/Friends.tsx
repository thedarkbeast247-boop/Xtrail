import { useState } from 'react';
import { Search, UserPlus, Users, MessageCircle, MapPin, TrendingUp, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  location: string;
  vehicleType: string;
  totalRides: number;
  level: number;
  isOnline: boolean;
}

interface RidingGroup {
  id: string;
  name: string;
  memberCount: number;
  upcomingRides: number;
  image: string;
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'SC',
    location: 'Cape Town',
    vehicleType: 'Dual-Sport',
    totalRides: 47,
    level: 12,
    isOnline: true
  },
  {
    id: '2',
    name: 'Mike Johnson',
    avatar: 'MJ',
    location: 'Johannesburg',
    vehicleType: '4x4',
    totalRides: 89,
    level: 18,
    isOnline: true
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'EW',
    location: 'Durban',
    vehicleType: 'ATV',
    totalRides: 34,
    level: 9,
    isOnline: false
  },
  {
    id: '4',
    name: 'David Brown',
    avatar: 'DB',
    location: 'Pretoria',
    vehicleType: 'Motocross',
    totalRides: 112,
    level: 22,
    isOnline: false
  }
];

const mockGroups: RidingGroup[] = [
  {
    id: '1',
    name: 'Cape Town Riders',
    memberCount: 24,
    upcomingRides: 3,
    image: 'https://images.unsplash.com/photo-1564912677462-6a1d6102473d?w=400'
  },
  {
    id: '2',
    name: 'Weekend Warriors',
    memberCount: 15,
    upcomingRides: 1,
    image: 'https://images.unsplash.com/photo-1768924467539-aaffb9e4df47?w=400'
  },
  {
    id: '3',
    name: 'Enduro Enthusiasts',
    memberCount: 31,
    upcomingRides: 5,
    image: 'https://images.unsplash.com/photo-1770130636832-bff00259121c?w=400'
  }
];

export function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <h1 className="text-white text-2xl mb-1">Friends & Groups</h1>
        <p className="text-neutral-400 text-sm">Connect with fellow riders</p>
      </div>

      <div className="px-4 py-5">
        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-white pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border border-neutral-800 mb-5">
            <TabsTrigger value="friends" className="data-[state=active]:bg-red-600">
              Friends ({mockFriends.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-red-600">
              Groups ({mockGroups.length})
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-3">
            {filteredFriends.map(friend => (
              <div
                key={friend.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                      {friend.avatar}
                    </div>
                    {friend.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-900"></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white mb-0.5">{friend.name}</h3>
                        <div className="flex items-center gap-2 text-neutral-400 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{friend.location}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-950 -mt-1">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-xs">
                        {friend.vehicleType}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Level {friend.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-neutral-300 text-sm">{friend.totalRides} rides</span>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 h-7 text-xs">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Friend Button */}
            <Button
              variant="outline"
              className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6"
            >
              <UserPlus className="w-4 h-4" />
              Find More Riders
            </Button>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-3">
            {mockGroups.map(group => (
              <div
                key={group.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Group Image */}
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${group.image})` }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white mb-2">{group.name}</h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{group.upcomingRides} upcoming</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 h-7 text-xs">
                      View Group
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Create Group Button */}
            <Button
              variant="outline"
              className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6"
            >
              <Users className="w-4 h-4" />
              Create New Group
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
