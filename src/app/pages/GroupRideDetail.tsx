import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useNotification } from "../context/NotificationContext";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Mountain,
  Plus,
  Route,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type GroupStatus = "joined" | "available";
type GroupRideStatus = "available" | "joined";
type GroupRideInviteStatus = "invited" | "accepted" | "declined";

interface RidingGroup {
  id: string;
  name: string;
  memberCount: number;
  upcomingRides: number;
  image: string;
  description: string;
  status: GroupStatus;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  vehicleType: string;
  location: string;
  isOnline: boolean;
}

interface GroupInviteCandidate {
  id: string;
  name: string;
  avatar: string;
  vehicleType: string;
  location: string;
  isOnline: boolean;
}

interface GroupInvite {
  groupId: string;
  riderId: string;
  status: "invited" | "joined";
}

interface GroupRide {
  id: string;
  groupId: string;
  title: string;
  date: string;
  time: string;
  meetingPoint: string;
  trailName: string;
  difficulty: string;
  vehicleTypes: string[];
  joinedRiders: number;
  maxRiders: number;
  status: GroupRideStatus;
}

interface GroupRideInvite {
  id: string;
  groupId: string;
  rideId: string;
  memberId: string;
  status: GroupRideInviteStatus;
}

interface RideChecklistItem {
  id: string;
  label: string;
  description: string;
}

type RideChecklistMode = "standard" | "custom";

const GROUPS_STORAGE_KEY = "xtrail-riding-groups";
const GROUP_INVITES_STORAGE_KEY = "xtrail-group-invites";
const GROUP_RIDES_STORAGE_KEY = "xtrail-group-rides";
const GROUP_RIDE_INVITES_STORAGE_KEY = "xtrail-group-ride-invites";
const RIDE_CHECKLIST_STORAGE_KEY = "xtrail-group-ride-detail-checklists";
const CUSTOM_RIDE_CHECKLIST_STORAGE_KEY =
  "xtrail-group-ride-detail-custom-checklists";
const RIDE_CHECKLIST_MODE_STORAGE_KEY =
  "xtrail-group-ride-detail-checklist-modes";

const mockGroups: RidingGroup[] = [
  {
    id: "1",
    name: "Cape Town Riders",
    memberCount: 24,
    upcomingRides: 3,
    image: "https://images.unsplash.com/photo-1564912677462-6a1d6102473d?w=400",
    description:
      "Weekend rides, scenic routes, and mixed off-road adventures around Cape Town.",
    status: "available",
  },
  {
    id: "2",
    name: "Weekend Warriors",
    memberCount: 15,
    upcomingRides: 1,
    image: "https://images.unsplash.com/photo-1768924467539-aaffb9e4df47?w=400",
    description:
      "Casual weekend rides for riders who want to explore without pressure.",
    status: "available",
  },
  {
    id: "3",
    name: "Enduro Enthusiasts",
    memberCount: 31,
    upcomingRides: 5,
    image: "https://images.unsplash.com/photo-1770130636832-bff00259121c?w=400",
    description:
      "Technical trails, enduro loops, rocky climbs, and skill-building rides.",
    status: "available",
  },
];

const mockGroupMembers: GroupMember[] = [
  {
    id: "member-you",
    name: "You",
    avatar: "YU",
    role: "Owner",
    vehicleType: "Active Vehicle",
    location: "Your area",
    isOnline: true,
  },
  {
    id: "member-1",
    name: "Sarah Chen",
    avatar: "SC",
    role: "Ride Leader",
    vehicleType: "Dual-Sport",
    location: "Cape Town",
    isOnline: true,
  },
  {
    id: "member-2",
    name: "Mike Johnson",
    avatar: "MJ",
    role: "Trail Scout",
    vehicleType: "4x4",
    location: "Johannesburg",
    isOnline: true,
  },
  {
    id: "member-3",
    name: "Emma Wilson",
    avatar: "EW",
    role: "Admin",
    vehicleType: "ATV",
    location: "Durban",
    isOnline: false,
  },
];

const mockInviteCandidates: GroupInviteCandidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    vehicleType: "Dual-Sport",
    location: "Cape Town",
    isOnline: true,
  },
  {
    id: "2",
    name: "Mike Johnson",
    avatar: "MJ",
    vehicleType: "4x4",
    location: "Johannesburg",
    isOnline: true,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "EW",
    vehicleType: "ATV",
    location: "Durban",
    isOnline: false,
  },
  {
    id: "4",
    name: "David Brown",
    avatar: "DB",
    vehicleType: "Motocross",
    location: "Pretoria",
    isOnline: false,
  },
];

const mockGroupRides: GroupRide[] = [
  {
    id: "ride-1",
    groupId: "1",
    title: "Sunday Forest Loop",
    date: "2026-06-07",
    time: "08:30",
    meetingPoint: "Cape Town Shell Garage",
    trailName: "Forest Ridge Trail",
    difficulty: "Intermediate",
    vehicleTypes: ["Dirt Bike", "Dual-Sport"],
    joinedRiders: 6,
    maxRiders: 12,
    status: "available",
  },
  {
    id: "ride-2",
    groupId: "1",
    title: "Mountain Pass Morning Ride",
    date: "2026-06-14",
    time: "07:00",
    meetingPoint: "Hout Bay Parking Area",
    trailName: "Mountain Pass Route",
    difficulty: "Moderate",
    vehicleTypes: ["Adventure Bike", "4x4"],
    joinedRiders: 4,
    maxRiders: 10,
    status: "available",
  },
  {
    id: "ride-3",
    groupId: "1",
    title: "Beginner Gravel Social",
    date: "2026-06-21",
    time: "09:00",
    meetingPoint: "Durbanville Fuel Stop",
    trailName: "Easy Gravel Loop",
    difficulty: "Easy",
    vehicleTypes: ["Dual-Sport", "Adventure Bike", "4x4"],
    joinedRiders: 8,
    maxRiders: 15,
    status: "available",
  },
  {
    id: "ride-4",
    groupId: "2",
    title: "Weekend Warrior Trail Day",
    date: "2026-06-08",
    time: "08:00",
    meetingPoint: "Main Trail Gate",
    trailName: "Weekend Loop",
    difficulty: "Intermediate",
    vehicleTypes: ["Dirt Bike", "ATV", "SXS"],
    joinedRiders: 5,
    maxRiders: 10,
    status: "available",
  },
  {
    id: "ride-5",
    groupId: "3",
    title: "Technical Rocks Session",
    date: "2026-06-09",
    time: "07:30",
    meetingPoint: "Enduro Parking Zone",
    trailName: "Rock Garden Climb",
    difficulty: "Hard",
    vehicleTypes: ["Dirt Bike"],
    joinedRiders: 7,
    maxRiders: 8,
    status: "available",
  },
];

const rideChecklistItems: RideChecklistItem[] = [
  {
    id: "helmet",
    label: "Helmet",
    description: "Helmet and riding protection are ready.",
  },
  {
    id: "water",
    label: "Water",
    description: "Enough water packed for the full ride.",
  },
  {
    id: "fuel",
    label: "Fuel",
    description: "Vehicle has enough fuel for the route.",
  },
  {
    id: "tools",
    label: "Tools",
    description: "Basic tools, repair kit, and spares packed.",
  },
  {
    id: "phone",
    label: "Phone charged",
    description: "Phone battery charged and emergency contacts available.",
  },
  {
    id: "first-aid",
    label: "First aid",
    description: "First aid kit or emergency supplies packed.",
  },
  {
    id: "route",
    label: "Route downloaded",
    description: "Route, map, or trail info saved before leaving.",
  },
];

function loadGroups() {
  const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);

  if (!storedGroups) return mockGroups;

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
    console.error("Failed to load groups:", error);
    return mockGroups;
  }
}

function loadGroupInvites() {
  const storedGroupInvites = localStorage.getItem(GROUP_INVITES_STORAGE_KEY);

  if (!storedGroupInvites) return [];

  try {
    const parsedGroupInvites = JSON.parse(storedGroupInvites) as GroupInvite[];

    if (!Array.isArray(parsedGroupInvites)) return [];

    return parsedGroupInvites.filter(
      (invite) =>
        invite.groupId &&
        invite.riderId &&
        (invite.status === "invited" || invite.status === "joined")
    );
  } catch (error) {
    console.error("Failed to load group invites:", error);
    return [];
  }
}

function loadGroupRides() {
  const storedGroupRides = localStorage.getItem(GROUP_RIDES_STORAGE_KEY);

  if (!storedGroupRides) return mockGroupRides;

  try {
    const parsedGroupRides = JSON.parse(storedGroupRides) as GroupRide[];

    if (!Array.isArray(parsedGroupRides) || parsedGroupRides.length === 0) {
      return mockGroupRides;
    }

    return parsedGroupRides.map((ride) => ({
      ...ride,
      vehicleTypes: ride.vehicleTypes ?? [],
      status: ride.status ?? "available",
    }));
  } catch (error) {
    console.error("Failed to load group rides:", error);
    return mockGroupRides;
  }
}

function loadGroupRideInvites() {
  const storedRideInvites = localStorage.getItem(GROUP_RIDE_INVITES_STORAGE_KEY);

  if (!storedRideInvites) return [];

  try {
    const parsedRideInvites = JSON.parse(storedRideInvites) as GroupRideInvite[];

    if (!Array.isArray(parsedRideInvites)) return [];

    return parsedRideInvites.filter(
      (invite) =>
        invite.id &&
        invite.groupId &&
        invite.rideId &&
        invite.memberId &&
        (invite.status === "invited" ||
          invite.status === "accepted" ||
          invite.status === "declined")
    );
  } catch (error) {
    console.error("Failed to load ride invites:", error);
    return [];
  }
}

function loadRideChecklists() {
  const storedChecklists = localStorage.getItem(RIDE_CHECKLIST_STORAGE_KEY);

  if (!storedChecklists) return {};

  try {
    const parsedChecklists = JSON.parse(storedChecklists) as Record<
      string,
      string[]
    >;

    return parsedChecklists && typeof parsedChecklists === "object"
      ? parsedChecklists
      : {};
  } catch (error) {
    console.error("Failed to load ride checklist:", error);
    return {};
  }
}

function loadCustomRideChecklistItems() {
  const storedCustomItems = localStorage.getItem(
    CUSTOM_RIDE_CHECKLIST_STORAGE_KEY
  );

  if (!storedCustomItems) return {};

  try {
    const parsedCustomItems = JSON.parse(storedCustomItems) as Record<
      string,
      RideChecklistItem[]
    >;

    return parsedCustomItems && typeof parsedCustomItems === "object"
      ? parsedCustomItems
      : {};
  } catch (error) {
    console.error("Failed to load custom ride checklist items:", error);
    return {};
  }
}

function loadRideChecklistModes() {
  const storedModes = localStorage.getItem(RIDE_CHECKLIST_MODE_STORAGE_KEY);

  if (!storedModes) return {};

  try {
    const parsedModes = JSON.parse(storedModes) as Record<
      string,
      RideChecklistMode
    >;

    return parsedModes && typeof parsedModes === "object" ? parsedModes : {};
  } catch (error) {
    console.error("Failed to load ride checklist modes:", error);
    return {};
  }
}

function getRideInviteStatusClass(status: GroupRideInviteStatus) {
  if (status === "accepted") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "declined") {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return "border-orange-500/20 bg-orange-500/10 text-orange-400";
}

function getRideInviteStatusLabel(status: GroupRideInviteStatus) {
  if (status === "accepted") return "Accepted";
  if (status === "declined") return "Declined";
  return "Invited";
}

export function GroupRideDetail() {
  const { groupId, rideId } = useParams();
  const { showNotification } = useNotification();

  const [groups] = useState<RidingGroup[]>(loadGroups);
  const [groupInvites] = useState<GroupInvite[]>(loadGroupInvites);
  const [groupRides, setGroupRides] = useState<GroupRide[]>(loadGroupRides);
  const [groupRideInvites, setGroupRideInvites] =
    useState<GroupRideInvite[]>(loadGroupRideInvites);
  const [rideChecklists, setRideChecklists] = useState<Record<string, string[]>>(
    loadRideChecklists
  );

  const [customRideChecklistItems, setCustomRideChecklistItems] = useState<
    Record<string, RideChecklistItem[]>
  >(loadCustomRideChecklistItems);

  const [rideChecklistModes, setRideChecklistModes] = useState<
    Record<string, RideChecklistMode>
  >(loadRideChecklistModes);

  const [newChecklistItem, setNewChecklistItem] = useState({
    label: "",
    description: "",
  });

  useEffect(() => {
    localStorage.setItem(GROUP_RIDES_STORAGE_KEY, JSON.stringify(groupRides));
  }, [groupRides]);

  useEffect(() => {
    localStorage.setItem(
      GROUP_RIDE_INVITES_STORAGE_KEY,
      JSON.stringify(groupRideInvites)
    );
  }, [groupRideInvites]);

  useEffect(() => {
    localStorage.setItem(
      RIDE_CHECKLIST_STORAGE_KEY,
      JSON.stringify(rideChecklists)
    );
  }, [rideChecklists]);

  useEffect(() => {
    localStorage.setItem(
      CUSTOM_RIDE_CHECKLIST_STORAGE_KEY,
      JSON.stringify(customRideChecklistItems)
    );
  }, [customRideChecklistItems]);

  useEffect(() => {
    localStorage.setItem(
      RIDE_CHECKLIST_MODE_STORAGE_KEY,
      JSON.stringify(rideChecklistModes)
    );
  }, [rideChecklistModes]);

  const group = groups.find((item) => item.id === groupId);
  const ride = groupRides.find(
    (item) => item.id === rideId && item.groupId === groupId
  );

  const acceptedInviteMembers: GroupMember[] = mockInviteCandidates
    .filter((candidate) =>
      groupInvites.some(
        (invite) =>
          invite.groupId === groupId &&
          invite.riderId === candidate.id &&
          invite.status === "joined"
      )
    )
    .filter(
      (candidate) =>
        !mockGroupMembers.some((member) => member.name === candidate.name)
    )
    .map((candidate) => ({
      id: `invite-member-${candidate.id}`,
      name: candidate.name,
      avatar: candidate.avatar,
      role: "Group Member",
      vehicleType: candidate.vehicleType,
      location: candidate.location,
      isOnline: candidate.isOnline,
    }));

  const visibleGroupMembers = [
    ...mockGroupMembers,
    ...acceptedInviteMembers,
  ];

  const rideInviteRows = groupRideInvites
    .filter((invite) => invite.groupId === groupId && invite.rideId === rideId)
    .map((invite) => {
      const member = visibleGroupMembers.find(
        (item) => item.id === invite.memberId
      );

      if (!member) return null;

      return {
        invite,
        member,
      };
    })
    .filter(
      (
        item
      ): item is {
        invite: GroupRideInvite;
        member: GroupMember;
      } => item !== null
    );

  const pendingInviteRows = rideInviteRows.filter(
    ({ invite }) => invite.status === "invited"
  );
  const acceptedInviteRows = rideInviteRows.filter(
    ({ invite }) => invite.status === "accepted"
  );
  const declinedInviteRows = rideInviteRows.filter(
    ({ invite }) => invite.status === "declined"
  );

  const currentChecklistMode: RideChecklistMode = rideId
    ? rideChecklistModes[rideId] ?? "standard"
    : "standard";

  const customChecklistItems = rideId
    ? customRideChecklistItems[rideId] ?? []
    : [];

  const visibleRideChecklistItems =
    currentChecklistMode === "standard"
      ? rideChecklistItems
      : customChecklistItems;

const completedChecklistItems = rideId ? rideChecklists[rideId] ?? [] : [];

const completedChecklistCount = completedChecklistItems.filter((itemId) =>
  visibleRideChecklistItems.some((item) => item.id === itemId)
).length;

const checklistProgressPercent =
  visibleRideChecklistItems.length === 0
    ? 0
    : Math.round(
        (completedChecklistCount / visibleRideChecklistItems.length) * 100
      );

  const handleJoinRide = () => {
    if (!ride) return;

    if (ride.joinedRiders >= ride.maxRiders && ride.status !== "joined") {
      showNotification({
        title: "Ride is full",
        message: `${ride.title} has reached the maximum number of riders.`,
        variant: "warning",
      });

      return;
    }

    setGroupRides((prev) =>
      prev.map((item) =>
        item.id === ride.id
          ? {
              ...item,
              status: "joined",
              joinedRiders:
                item.status === "joined"
                  ? item.joinedRiders
                  : Math.min(item.joinedRiders + 1, item.maxRiders),
            }
          : item
      )
    );

    showNotification({
      title: "Joined ride",
      message: `You joined ${ride.title}.`,
      variant: "success",
    });
  };

  const handleLeaveRide = () => {
    if (!ride) return;

    setGroupRides((prev) =>
      prev.map((item) =>
        item.id === ride.id
          ? {
              ...item,
              status: "available",
              joinedRiders: Math.max(item.joinedRiders - 1, 0),
            }
          : item
      )
    );

    showNotification({
      title: "Left ride",
      message: `You left ${ride.title}.`,
      variant: "info",
    });
  };

  const handleAcceptRideInvite = (inviteId: string) => {
    if (!ride) return;

    if (ride.joinedRiders >= ride.maxRiders) {
      showNotification({
        title: "Ride is full",
        message: `${ride.title} has reached the maximum number of riders.`,
        variant: "warning",
      });

      return;
    }

    setGroupRideInvites((prev) =>
      prev.map((invite) =>
        invite.id === inviteId
          ? {
              ...invite,
              status: "accepted",
            }
          : invite
      )
    );

    setGroupRides((prev) =>
      prev.map((item) =>
        item.id === ride.id
          ? {
              ...item,
              joinedRiders: Math.min(item.joinedRiders + 1, item.maxRiders),
            }
          : item
      )
    );

    showNotification({
      title: "Ride invite accepted",
      message: `The rider was added to ${ride.title}.`,
      variant: "success",
    });
  };

  const handleDeclineRideInvite = (inviteId: string) => {
    if (!ride) return;

    setGroupRideInvites((prev) =>
      prev.map((invite) =>
        invite.id === inviteId
          ? {
              ...invite,
              status: "declined",
            }
          : invite
      )
    );

    showNotification({
      title: "Ride invite declined",
      message: `The invite for ${ride.title} was declined.`,
      variant: "info",
    });
  };

  const handleChecklistModeChange = (mode: RideChecklistMode) => {
    if (!rideId) return;

    setRideChecklistModes((prev) => ({
      ...prev,
      [rideId]: mode,
    }));

    showNotification({
      title:
        mode === "standard"
          ? "Standard checklist enabled"
          : "Custom checklist enabled",
      message:
        mode === "standard"
          ? "This ride is now using the standard group ride checklist."
          : "You can now build your own checklist for this ride.",
      variant: "info",
    });
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!rideId) return;

    setRideChecklists((prev) => {
      const currentItems = prev[rideId] ?? [];

      return {
        ...prev,
        [rideId]: currentItems.includes(itemId)
          ? currentItems.filter((id) => id !== itemId)
          : [...currentItems, itemId],
      };
    });
  };

  const handleAddCustomChecklistItem = () => {
    if (!rideId) return;

    const label = newChecklistItem.label.trim();
    const description = newChecklistItem.description.trim();

    if (!label) {
      showNotification({
        title: "Checklist item needed",
        message: "Add a checklist item name before saving it.",
        variant: "warning",
      });

      return;
    }

    const createdItem: RideChecklistItem = {
      id: `custom-${Date.now()}`,
      label,
      description: description || "Custom checklist item for this group ride.",
    };

    setCustomRideChecklistItems((prev) => ({
      ...prev,
      [rideId]: [...(prev[rideId] ?? []), createdItem],
    }));

    setNewChecklistItem({
      label: "",
      description: "",
    });

    showNotification({
      title: "Checklist item added",
      message: `${label} was added to this ride checklist.`,
      variant: "success",
    });
  };

  const handleDeleteCustomChecklistItem = (itemId: string) => {
    if (!rideId) return;

    const deletedItem = customChecklistItems.find((item) => item.id === itemId);

    setCustomRideChecklistItems((prev) => ({
      ...prev,
      [rideId]: (prev[rideId] ?? []).filter((item) => item.id !== itemId),
    }));

    setRideChecklists((prev) => ({
      ...prev,
      [rideId]: (prev[rideId] ?? []).filter((id) => id !== itemId),
    }));

    showNotification({
      title: "Checklist item removed",
      message: `${deletedItem?.label ?? "Custom item"} was removed from this ride checklist.`,
      variant: "info",
    });
  };

  if (!group || !ride) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6 text-white">
        <Link to={groupId ? `/friends/groups/${groupId}` : "/friends"}>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
          <p className="text-base font-semibold text-white">Ride not found</p>
          <p className="mt-2 text-sm text-neutral-400">
            This group ride could not be found.
          </p>
        </div>
      </div>
    );
  }

  const isRideFull = ride.joinedRiders >= ride.maxRiders;

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {/* Hero */}
      <div className="relative">
        <div className="h-56 w-full overflow-hidden">
          <img
            src={group.image}
            alt={ride.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-neutral-950" />

        <div className="absolute left-4 top-4 z-10">
          <Link to={`/friends/groups/${group.id}`}>
            <button className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/80">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
        </div>

        <div className="absolute -bottom-16 left-0 w-full px-4">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
              <Route className="h-9 w-9 text-orange-400" />
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                Group Ride
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold text-white">
                {ride.title}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
                <MapPin className="h-4 w-4 text-neutral-500" />
                {group.name}
              </p>
            </div>

            <div className="pb-2">
              {ride.status === "joined" ? (
                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                  Joined
                </span>
              ) : isRideFull ? (
                <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  Full
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-black">
                  Open
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pb-32 pt-20">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium">Date</span>
            </div>

            <p className="mt-3 text-sm font-bold text-white">
              {ride.date}
            </p>

            <p className="mt-1 text-xs text-neutral-500">{ride.time}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Riders</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {ride.joinedRiders}/{ride.maxRiders}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Mountain className="h-4 w-4" />
              <span className="text-xs font-medium">Difficulty</span>
            </div>

            <p className="mt-3 text-sm font-bold text-white">
              {ride.difficulty}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-purple-400">
              <UserPlus className="h-4 w-4" />
              <span className="text-xs font-medium">Invites</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {rideInviteRows.length}
            </p>
          </div>
        </div>

        {/* Ride Info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Ride Info</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <Route className="h-4 w-4" />
                <p className="text-xs">Trail / Route</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {ride.trailName}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <MapPin className="h-4 w-4" />
                <p className="text-xs">Meeting Point</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {ride.meetingPoint}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <Clock className="h-4 w-4" />
                <p className="text-xs">Departure</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {ride.date} at {ride.time}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ride.vehicleTypes.map((vehicleType) => (
              <span
                key={vehicleType}
                className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300"
              >
                {vehicleType}
              </span>
            ))}
          </div>
        </div>

        {/* Ride Actions */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Ride Actions</h2>

          <div className="mt-4 grid gap-3">
            {ride.status === "joined" ? (
              <button
                type="button"
                onClick={handleLeaveRide}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
              >
                <X className="h-4 w-4" />
                Leave Ride
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoinRide}
                disabled={isRideFull}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isRideFull
                    ? "border border-red-500/20 bg-red-500/10 text-red-400"
                    : "bg-orange-500 text-black hover:bg-orange-400"
                }`}
              >
                <Plus className="h-4 w-4" />
                {isRideFull ? "Ride Full" : "Join Ride"}
              </button>
            )}

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Message Ride Group
            </button>
          </div>
        </div>

        {/* Ride Invites */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Ride Invites
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Members invited to this ride.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {pendingInviteRows.length > 0 && (
                <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                  {pendingInviteRows.length} pending
                </span>
              )}

              {acceptedInviteRows.length > 0 && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  {acceptedInviteRows.length} accepted
                </span>
              )}

              {declinedInviteRows.length > 0 && (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  {declinedInviteRows.length} declined
                </span>
              )}
            </div>
          </div>

          {rideInviteRows.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">
                No ride invites yet
              </p>

              <p className="mt-2 text-sm text-neutral-400">
                Invite group members from the group ride card.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {rideInviteRows.map(({ invite, member }) => (
                <div
                  key={invite.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-sm font-bold text-white">
                      {member.avatar}

                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {member.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {member.role} • {member.vehicleType}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRideInviteStatusClass(
                        invite.status
                      )}`}
                    >
                      {getRideInviteStatusLabel(invite.status)}
                    </span>
                  </div>

                  {invite.status === "invited" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptRideInvite(invite.id)}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/15"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeclineRideInvite(invite.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/15"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ride Checklist */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
                <h2 className="text-base font-semibold text-white">
                    Group Ride Checklist
                </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Prep items for this group ride.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
                <button
                  type="button"
                  onClick={() => handleChecklistModeChange("standard")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    currentChecklistMode === "standard"
                      ? "bg-orange-500 text-black"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  Standard
                </button>

                <button
                  type="button"
                  onClick={() => handleChecklistModeChange("custom")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    currentChecklistMode === "custom"
                      ? "bg-orange-500 text-black"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {currentChecklistMode === "standard"
                  ? "Standard: recommended safety checklist."
                  : "Custom: build your own ride checklist."}
              </p>
            </div>

            <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300">
              {completedChecklistCount}/{visibleRideChecklistItems.length}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-neutral-400">
                Checklist progress
              </p>

              <p className="text-xs font-semibold text-orange-400">
                {checklistProgressPercent}%
              </p>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${checklistProgressPercent}%` }}
              />
            </div>
          </div>

          {currentChecklistMode === "custom" && (
            <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
              <h3 className="text-sm font-semibold text-white">Add custom item</h3>

              <p className="mt-1 text-xs text-neutral-500">
                Add anything specific you need for this group ride.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={newChecklistItem.label}
                  onChange={(event) =>
                    setNewChecklistItem((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Example: Spare tube"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />

                <textarea
                  value={newChecklistItem.description}
                  onChange={(event) =>
                    setNewChecklistItem((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Optional note, example: Pack a front tube and tyre levers."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />

                <button
                  type="button"
                  onClick={handleAddCustomChecklistItem}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Checklist Item
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3">
            {visibleRideChecklistItems.map((item) => {
              const isCompleted = completedChecklistItems.includes(item.id);
              const isCustomItem = item.id.startsWith("custom-");

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                    isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-black"
                        : "border-neutral-700 text-neutral-500"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {item.label}
                      </p>

                      {isCustomItem && (
                        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                          Custom
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {item.description}
                    </p>
                  </button>

                  {isCustomItem && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomChecklistItem(item.id)}
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}