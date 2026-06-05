import { useEffect, useState } from 'react';
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  MapPin,
  TrendingUp,
  Award,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Link } from 'react-router';
import { useNotification } from '../context/NotificationContext';

type FriendStatus = "friend" | "requested" | "suggested";
type FriendFilter = "all" | "friends" | "requests" | "suggested" | "online";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  location: string;
  vehicleType: string;
  totalRides: number;
  level: number;
  isOnline: boolean;
  status: FriendStatus;
}

type GroupStatus = "joined" | "available";

interface RidingGroup {
  id: string;
  name: string;
  memberCount: number;
  upcomingRides: number;
  image: string;
  description: string;
  status: GroupStatus;
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
    isOnline: true,
    status: "friend"
  },
  {
    id: '2',
    name: 'Mike Johnson',
    avatar: 'MJ',
    location: 'Johannesburg',
    vehicleType: '4x4',
    totalRides: 89,
    level: 18,
    isOnline: true,
    status: "friend"
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'EW',
    location: 'Durban',
    vehicleType: 'ATV',
    totalRides: 34,
    level: 9,
    isOnline: false,
    status: "suggested"
  },
  {
    id: '4',
    name: 'David Brown',
    avatar: 'DB',
    location: 'Pretoria',
    vehicleType: 'Motocross',
    totalRides: 112,
    level: 22,
    isOnline: false,
    status: "requested"
  }
];

const mockGroups: RidingGroup[] = [
  {
    id: '1',
    name: 'Cape Town Riders',
    memberCount: 24,
    upcomingRides: 3,
    image: 'https://images.unsplash.com/photo-1564912677462-6a1d6102473d?w=400',
    description: 'Weekend rides, scenic routes, and mixed off-road adventures around Cape Town.',
    status: "available",
  },
  {
    id: '2',
    name: 'Weekend Warriors',
    memberCount: 15,
    upcomingRides: 1,
    image: 'https://images.unsplash.com/photo-1768924467539-aaffb9e4df47?w=400',
    description: 'Casual weekend rides for riders who want to explore without pressure.',
    status: "available",
  },
  {
    id: '3',
    name: 'Enduro Enthusiasts',
    memberCount: 31,
    upcomingRides: 5,
    image: 'https://images.unsplash.com/photo-1770130636832-bff00259121c?w=400',
    description: 'Technical trails, enduro loops, rocky climbs, and skill-building rides.',
    status: "available",
  }
];

const FRIENDS_STORAGE_KEY = "xtrail-friends";
const GROUPS_STORAGE_KEY = "xtrail-riding-groups";

export function Friends() {
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [friendFilter, setFriendFilter] = useState<FriendFilter>('all');
  const [friends, setFriends] = useState<Friend[]>(() => {
    const storedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);

    if (!storedFriends) {
      return mockFriends;
    }

    try {
      const parsedFriends = JSON.parse(storedFriends) as Friend[];

      if (!Array.isArray(parsedFriends) || parsedFriends.length === 0) {
        return mockFriends;
      }

      return parsedFriends;
    } catch (error) {
      console.error("Failed to load friends:", error);
      return mockFriends;
    }
  });

  useEffect(() => {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  }, [friends]);

  const [groups, setGroups] = useState<RidingGroup[]>(() => {
    const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);

    if (!storedGroups) {
      return mockGroups;
    }

    try {
      const parsedGroups = JSON.parse(storedGroups) as RidingGroup[];

      if (!Array.isArray(parsedGroups) || parsedGroups.length === 0) {
        return mockGroups;
      }

      return parsedGroups.map((group) => ({
        ...group,
        description: group.description || "No group description yet.",
        status: group.status ?? "available",
      }));
    } catch (error) {
      console.error("Failed to load riding groups:", error);
      return mockGroups;
    }
  });

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const searchedFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = searchedFriends.filter((friend) => {
    if (friendFilter === "friends") return friend.status === "friend";
    if (friendFilter === "requests") return friend.status === "requested";
    if (friendFilter === "suggested") return friend.status === "suggested";
    if (friendFilter === "online") return friend.isOnline;

    return true;
  });

  const friendCount = friends.filter((friend) => friend.status === "friend").length;

  const requestedCount = friends.filter(
    (friend) => friend.status === "requested"
  ).length;

  const suggestedCount = friends.filter(
    (friend) => friend.status === "suggested"
  ).length;

  const onlineCount = friends.filter((friend) => friend.isOnline).length;

  const friendFilterOptions: {
    value: FriendFilter;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "All",
      count: friends.length,
    },
    {
      value: "friends",
      label: "Friends",
      count: friendCount,
    },
    {
      value: "requests",
      label: "Requests",
      count: requestedCount,
    },
    {
      value: "suggested",
      label: "Suggested",
      count: suggestedCount,
    },
    {
      value: "online",
      label: "Online",
      count: onlineCount,
    },
  ];

  const myFriends = filteredFriends.filter(
    (friend) => friend.status === "friend"
  );

  const requestedRiders = filteredFriends.filter(
    (friend) => friend.status === "requested"
  );

  const suggestedRiders = filteredFriends.filter(
    (friend) => friend.status === "suggested"
  );

  const handleFriendAction = (friendId: string) => {
    setFriends((prev) =>
      prev.map((friend) => {
        if (friend.id !== friendId) return friend;

        if (friend.status === "suggested") {
          return {
            ...friend,
            status: "requested",
          };
        }

        if (friend.status === "requested") {
          return {
            ...friend,
            status: "friend",
          };
        }

        return friend;
      })
    );
  };

  const getFriendActionLabel = (status: FriendStatus) => {
    if (status === "friend") return "Friends";
    if (status === "requested") return "Requested";
    return "Add Friend";
  };

  const getFriendActionClass = (status: FriendStatus) => {
    if (status === "friend") {
      return "border-emerald-500/20 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20";
    }

    if (status === "requested") {
      return "border-orange-500/20 bg-orange-500/15 text-orange-400 hover:bg-orange-500/20";
    }

    return "bg-red-600 text-white hover:bg-red-700";
  };

  const handleCreateGroup = () => {
    const groupName = newGroup.name.trim();
    const groupDescription = newGroup.description.trim();

    if (!groupName) {
      showNotification({
        title: "Group name needed",
        message: "Please enter a group name before creating a new group.",
        variant: "warning",
      });

      return;
    }

    const createdGroup: RidingGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      description: groupDescription || "No group description yet.",
      memberCount: 1,
      upcomingRides: 0,
      image: "https://images.unsplash.com/photo-1564912677462-6a1d6102473d?w=400",
      status: "joined",
    };

    setGroups((prev) => [createdGroup, ...prev]);

    setNewGroup({
      name: "",
      description: "",
    });

    setIsCreateGroupOpen(false);
    setActiveTab("groups");

    showNotification({
      title: "Group created",
      message: `${groupName} was added to your riding groups.`,
      variant: "success",
    });
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;

        if (group.status === "joined") {
          return group;
        }

        return {
          ...group,
          status: "joined",
          memberCount: group.memberCount + 1,
        };
      })
    );
  };

  const renderFriendCard = (friend: Friend) => (
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

            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-400 hover:bg-red-950 -mt-1"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Badge
              variant="outline"
              className="border-neutral-700 text-neutral-300 text-xs"
            >
              {friend.vehicleType}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Level {friend.level}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-neutral-300 text-sm">
                {friend.totalRides} rides
              </span>
            </div>

            <div className="flex gap-2">
              <Link to={`/friends/riders/${friend.id}`}>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="h-7 border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  View Profile
                </Button>
              </Link>

              <Button
                size="sm"
                type="button"
                onClick={() => handleFriendAction(friend.id)}
                className={`h-7 text-xs ${getFriendActionClass(friend.status)}`}
              >
                {getFriendActionLabel(friend.status)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <h1 className="text-white text-2xl mb-1">Friends & Groups</h1>
        <p className="text-neutral-400 text-sm">Connect with fellow riders</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Friends
            </p>
            <p className="mt-1 text-xl font-bold text-white">{friendCount}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Requests
            </p>
            <p className="mt-1 text-xl font-bold text-white">{requestedCount}</p>
          </div>
        </div>
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
              Friends ({friendCount})
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-red-600">
              Groups ({groups.length})
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {friendFilterOptions.map((filter) => {
                const isActive = friendFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFriendFilter(filter.value)}
                    className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                );
              })}
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-base font-semibold">My Friends</h2>
                  <p className="text-neutral-500 text-sm">
                    Riders already connected with you.
                  </p>
                </div>

                <span className="rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400">
                  {myFriends.length}
                </span>
              </div>

              <div className="space-y-3">
                {myFriends.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-white">No friends yet</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      Add suggested riders to start building your riding network.
                    </p>
                  </div>
                ) : (
                  myFriends.map(renderFriendCard)
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-base font-semibold">Friend Requests</h2>
                  <p className="text-neutral-500 text-sm">
                    Riders waiting to be added.
                  </p>
                </div>

                <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-400">
                  {requestedRiders.length}
                </span>
              </div>

              <div className="space-y-3">
                {requestedRiders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900 px-4 py-5 text-center">
                    <p className="text-sm text-neutral-500">No pending requests.</p>
                  </div>
                ) : (
                  requestedRiders.map(renderFriendCard)
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-base font-semibold">Suggested Riders</h2>
                  <p className="text-neutral-500 text-sm">
                    Riders matched by vehicle type, location, and activity.
                  </p>
                </div>

                <span className="rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400">
                  {suggestedRiders.length}
                </span>
              </div>

              <div className="space-y-3">
                {suggestedRiders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-900 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-white">
                      No suggested riders found
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      Try searching by rider name, location, or vehicle type.
                    </p>
                  </div>
                ) : (
                  suggestedRiders.map(renderFriendCard)
                )}
              </div>
            </div>

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
            {groups.map(group => (
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
                    <p className="mb-3 line-clamp-2 text-sm text-neutral-400">
                      {group.description}
                    </p>
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
                    <div className="flex gap-2">
                      <Link to={`/friends/groups/${group.id}`} className="flex-1">
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          className="h-8 w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        >
                          View Group
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.status === "joined"}
                        className={`h-8 flex-1 text-xs ${
                          group.status === "joined"
                            ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {group.status === "joined" ? "Joined" : "Join"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create Group Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateGroupOpen(true)}
              className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-900 gap-2 py-6"
            >
              <Plus className="w-4 h-4" />
              Create New Group
            </Button>
          </TabsContent>
        </Tabs>
            </div>

      {isCreateGroupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsCreateGroupOpen(false)}
        >
          <div
            className="w-full max-w-[390px] rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Riding Group
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Create New Group
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Start a group for rides, routes, and off-road plans.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Group name
                </label>

                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(event) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: Cape Town Enduro Crew"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Description
                </label>

                <textarea
                  value={newGroup.description}
                  onChange={(event) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Example: Weekend technical rides, rocky climbs, and beginner-friendly group rides."
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateGroup}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
