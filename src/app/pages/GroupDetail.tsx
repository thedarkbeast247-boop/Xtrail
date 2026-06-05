import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useNotification } from "../context/NotificationContext";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Mountain,
  Plus,
  Route,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";

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

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  vehicleType: string;
  location: string;
  isOnline: boolean;
}

interface GroupRule {
  id: string;
  title: string;
  description: string;
}

interface GroupAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
}

type GroupInviteStatus = "not_invited" | "invited" | "joined";

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
  status: Exclude<GroupInviteStatus, "not_invited">;
}

type GroupRideStatus = "available" | "joined";

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

type GroupRideInviteStatus = "invited" | "accepted" | "declined";

interface GroupRideInvite {
  id: string;
  groupId: string;
  rideId: string;
  memberId: string;
  status: GroupRideInviteStatus;
}

type NewGroupRideForm = {
  title: string;
  date: string;
  time: string;
  meetingPoint: string;
  trailName: string;
  difficulty: string;
  vehicleTypes: string[];
  maxRiders: number;
  invitedMemberIds: string[];
};

const rideDifficultyOptions = ["Easy", "Moderate", "Intermediate", "Hard", "Expert"];

const rideVehicleTypeOptions = [
  "Dirt Bike",
  "Dual-Sport",
  "Adventure Bike",
  "4x4",
  "ATV",
  "SXS",
];

const GROUPS_STORAGE_KEY = "xtrail-riding-groups";
const GROUP_RIDES_STORAGE_KEY = "xtrail-group-rides";
const GROUP_INVITES_STORAGE_KEY = "xtrail-group-invites";
const GROUP_RIDE_INVITES_STORAGE_KEY = "xtrail-group-ride-invites";

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

const mockGroupRules: GroupRule[] = [
  {
    id: "rule-1",
    title: "Respect the trail",
    description:
      "Stay on permitted routes, respect land access rules, and leave gates as you found them.",
  },
  {
    id: "rule-2",
    title: "No rider left behind",
    description:
      "Ride as a group, wait at route splits, and check that everyone makes it through safely.",
  },
  {
    id: "rule-3",
    title: "Bring the basics",
    description:
      "Carry water, fuel, tools, phone battery, and any safety gear needed for the ride type.",
  },
  {
    id: "rule-4",
    title: "Ride at your own pace",
    description:
      "Do not pressure other riders into difficult sections. Help each other and keep the ride safe.",
  },
];

const mockGroupAnnouncements: GroupAnnouncement[] = [
  {
    id: "announcement-1",
    title: "Next ride briefing",
    message:
      "Please arrive 20 minutes early for the next group ride so we can check routes, fuel, and rider experience levels.",
    date: "2026-06-01",
  },
  {
    id: "announcement-2",
    title: "Bring extra water",
    message:
      "Recent rides have been hot and dusty. Bring extra water and make sure your phone is fully charged before leaving.",
    date: "2026-05-28",
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
  {
    id: "ride-6",
    groupId: "3",
    title: "Enduro Skills Morning",
    date: "2026-06-12",
    time: "08:00",
    meetingPoint: "Training Loop Entrance",
    trailName: "Technical Practice Loop",
    difficulty: "Intermediate",
    vehicleTypes: ["Dirt Bike"],
    joinedRiders: 4,
    maxRiders: 8,
    status: "available",
  },
  {
    id: "ride-7",
    groupId: "3",
    title: "Forest Single Track",
    date: "2026-06-16",
    time: "07:00",
    meetingPoint: "Forest Trail Start",
    trailName: "Single Track Route",
    difficulty: "Hard",
    vehicleTypes: ["Dirt Bike"],
    joinedRiders: 6,
    maxRiders: 10,
    status: "available",
  },
  {
    id: "ride-8",
    groupId: "3",
    title: "Slow Technical Climb Day",
    date: "2026-06-19",
    time: "08:30",
    meetingPoint: "Rocky Valley Gate",
    trailName: "Rocky Valley Climb",
    difficulty: "Expert",
    vehicleTypes: ["Dirt Bike"],
    joinedRiders: 3,
    maxRiders: 6,
    status: "available",
  },
  {
    id: "ride-9",
    groupId: "3",
    title: "Enduro Social Loop",
    date: "2026-06-23",
    time: "09:00",
    meetingPoint: "Town Fuel Stop",
    trailName: "Social Enduro Loop",
    difficulty: "Moderate",
    vehicleTypes: ["Dirt Bike", "Dual-Sport"],
    joinedRiders: 9,
    maxRiders: 14,
    status: "available",
  },
];

function loadGroups() {
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
}

function loadGroupRides() {
  const storedGroupRides = localStorage.getItem(GROUP_RIDES_STORAGE_KEY);

  if (!storedGroupRides) {
    return mockGroupRides;
  }

  try {
    const parsedGroupRides = JSON.parse(storedGroupRides) as GroupRide[];

    if (!Array.isArray(parsedGroupRides) || parsedGroupRides.length === 0) {
      return mockGroupRides;
    }

    return parsedGroupRides.map((ride) => ({
      ...ride,
      status: ride.status ?? "available",
      vehicleTypes: ride.vehicleTypes ?? [],
    }));
  } catch (error) {
    console.error("Failed to load group rides:", error);
    return mockGroupRides;
  }
}

function loadGroupInvites() {
  const storedGroupInvites = localStorage.getItem(GROUP_INVITES_STORAGE_KEY);

  if (!storedGroupInvites) {
    return [];
  }

  try {
    const parsedGroupInvites = JSON.parse(storedGroupInvites) as GroupInvite[];

    if (!Array.isArray(parsedGroupInvites)) {
      return [];
    }

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

function loadGroupRideInvites() {
  const storedRideInvites = localStorage.getItem(GROUP_RIDE_INVITES_STORAGE_KEY);

  if (!storedRideInvites) {
    return [];
  }

  try {
    const parsedRideInvites = JSON.parse(storedRideInvites) as GroupRideInvite[];

    if (!Array.isArray(parsedRideInvites)) {
      return [];
    }

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
    console.error("Failed to load group ride invites:", error);
    return [];
  }
}

export function GroupDetail() {
  const { groupId } = useParams();
  const { showNotification } = useNotification();
  const [groups, setGroups] = useState<RidingGroup[]>(loadGroups);
  const [groupRides, setGroupRides] = useState<GroupRide[]>(loadGroupRides);
  const [groupInvites, setGroupInvites] = useState<GroupInvite[]>(loadGroupInvites);
  const [groupRideInvites, setGroupRideInvites] =
    useState<GroupRideInvite[]>(loadGroupRideInvites);
  const [isInviteFriendsOpen, setIsInviteFriendsOpen] = useState(false);
  const [selectedInviteRiderIds, setSelectedInviteRiderIds] = useState<string[]>([]);


  const [isCreateRideOpen, setIsCreateRideOpen] = useState(false);

  const [rideInviteModalRideId, setRideInviteModalRideId] = useState<string | null>(
    null
  );

  const [
    selectedExistingRideInviteMemberIds,
    setSelectedExistingRideInviteMemberIds,
  ] = useState<string[]>([]);

  const [newGroupRide, setNewGroupRide] = useState<NewGroupRideForm>({
    title: "",
    date: "",
    time: "",
    meetingPoint: "",
    trailName: "",
    difficulty: "Intermediate",
    vehicleTypes: [],
    maxRiders: 10,
    invitedMemberIds: [],
  });

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(GROUP_RIDES_STORAGE_KEY, JSON.stringify(groupRides));
  }, [groupRides]);

  useEffect(() => {
    localStorage.setItem(GROUP_INVITES_STORAGE_KEY, JSON.stringify(groupInvites));
  }, [groupInvites]);

  useEffect(() => {
    localStorage.setItem(
      GROUP_RIDE_INVITES_STORAGE_KEY,
      JSON.stringify(groupRideInvites)
    );
  }, [groupRideInvites]);

  const group = groups.find((item) => item.id === groupId);

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

  const baseGroupMembers =
    group?.status === "joined"
      ? mockGroupMembers
      : mockGroupMembers.filter((member) => member.id !== "member-you");

  const visibleGroupMembers = [...baseGroupMembers, ...acceptedInviteMembers];

  const displayedMemberCount = visibleGroupMembers.length;

  const rideInviteMemberOptions = visibleGroupMembers.filter(
    (member) => member.id !== "member-you"
  );

  const getRideInvitesForRide = (rideId: string) =>
    groupRideInvites.filter(
      (invite) => invite.groupId === groupId && invite.rideId === rideId
    );

  const getRideInviteCounts = (rideId: string) => {
    const rideInvites = getRideInvitesForRide(rideId);

    return {
      invited: rideInvites.filter((invite) => invite.status === "invited").length,
      accepted: rideInvites.filter((invite) => invite.status === "accepted").length,
      declined: rideInvites.filter((invite) => invite.status === "declined").length,
    };
  };

  const getRideInviteMemberRows = (rideId: string) =>
    getRideInvitesForRide(rideId)
      .map((invite) => {
        const member = visibleGroupMembers.find(
          (groupMember) => groupMember.id === invite.memberId
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

  const getRideInviteStatusClass = (
    status: GroupRideInviteStatus | "not_invited"
  ) => {
    if (status === "accepted") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    if (status === "declined") {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }

    return "border-orange-500/20 bg-orange-500/10 text-orange-400";
  };

  const getRideInviteStatusLabel = (
    status: GroupRideInviteStatus | "not_invited"
  ) => {
    if (status === "accepted") return "Accepted";
    if (status === "declined") return "Declined";
    if (status === "not_invited") return "Not invited";
    return "Invited";
  };

  const visibleGroupRides = groupRides.filter(
    (ride) => ride.groupId === groupId
  );

  const displayedUpcomingRideCount = visibleGroupRides.length;

  const selectedRideForInvites = visibleGroupRides.find(
    (ride) => ride.id === rideInviteModalRideId
  );

  const rideInviteModalMemberOptions = selectedRideForInvites
    ? rideInviteMemberOptions.map((member) => {
        const existingInvite = groupRideInvites.find(
          (invite) =>
            invite.groupId === groupId &&
            invite.rideId === selectedRideForInvites.id &&
            invite.memberId === member.id
        );

        return {
          ...member,
          rideInviteStatus: (existingInvite?.status ?? "not_invited") as
            | GroupRideInviteStatus
            | "not_invited",
        };
      })
    : [];

  const visibleInviteCandidates = mockInviteCandidates.map((candidate) => {
    const invite = groupInvites.find(
      (item) => item.groupId === groupId && item.riderId === candidate.id
    );

    return {
      ...candidate,
      status: invite?.status ?? "not_invited",
    };
  });

  const pendingInvites = visibleInviteCandidates.filter(
    (candidate) => candidate.status === "invited"
  );

  const acceptedInvites = visibleInviteCandidates.filter(
    (candidate) => candidate.status === "joined"
  );

  const pendingInviteCount = pendingInvites.length;
  const acceptedInviteCount = acceptedInvites.length;
  const selectedInviteCount = selectedInviteRiderIds.length;

  const toggleInviteSelection = (riderId: string) => {
    const candidate = visibleInviteCandidates.find((item) => item.id === riderId);

    if (!candidate || candidate.status !== "not_invited") {
      return;
    }

    setSelectedInviteRiderIds((prev) =>
      prev.includes(riderId)
        ? prev.filter((id) => id !== riderId)
        : [...prev, riderId]
    );
  };

  const handleSendInvites = () => {
    if (!groupId) return;

    if (selectedInviteRiderIds.length === 0) {
      showNotification({
      title: "No riders selected",
      message: "Select at least one rider before sending group invites.",
      variant: "warning",
    });
      return;
    }

    setGroupInvites((prev) => {
      const existingInviteKeys = new Set(
        prev.map((invite) => `${invite.groupId}-${invite.riderId}`)
      );

      const newInvites: GroupInvite[] = selectedInviteRiderIds
        .filter((riderId) => !existingInviteKeys.has(`${groupId}-${riderId}`))
        .map((riderId) => ({
          groupId,
          riderId,
          status: "invited",
        }));

      return [...prev, ...newInvites];
    });

    showNotification({
      title: "Invites sent",
      message: `${selectedInviteRiderIds.length} riders invited to ${
        group?.name ?? "this group"
      }.`,
      variant: "success",
    });

    setSelectedInviteRiderIds([]);
    setIsInviteFriendsOpen(false);
  };

  const handleMarkInviteJoined = (riderId: string) => {
    if (!groupId) return;

    const invitedRider = mockInviteCandidates.find(
      (candidate) => candidate.id === riderId
    );

    setGroupInvites((prev) =>
      prev.map((invite) => {
        if (invite.groupId !== groupId || invite.riderId !== riderId) {
          return invite;
        }

        if (invite.status === "joined") {
          return invite;
        }

        return {
          ...invite,
          status: "joined",
        };
      })
    );

    setGroups((prev) =>
      prev.map((item) => {
        if (item.id !== groupId) return item;

        return {
          ...item,
          memberCount: item.memberCount + 1,
        };
      })
    );

    showNotification({
      title: "Ride invites sent",
      message: `${selectedInviteRiderIds.length} rider${
        selectedInviteRiderIds.length === 1 ? "" : "s"
      } invited to ${group?.name ?? "this group"}.`,
      variant: "success",
    });
  };

  const handleCancelInvite = (riderId: string) => {
    if (!groupId) return;

    const invitedRider = mockInviteCandidates.find(
      (candidate) => candidate.id === riderId
    );

    setGroupInvites((prev) =>
      prev.filter(
        (invite) =>
          !(invite.groupId === groupId && invite.riderId === riderId)
      )
    );

    showNotification({
      title: "Invite cancelled",
      message: `${invitedRider?.name ?? "Rider"} was removed from the pending invites.`,
      variant: "info",
    });
  };

  const handleJoinGroup = () => {
    if (!group) return;

    setGroups((prev) =>
      prev.map((item) => {
        if (item.id !== group.id) return item;

        if (item.status === "joined") {
          return item;
        }

        return {
          ...item,
          status: "joined",
          memberCount: item.memberCount + 1,
        };
      })
    );
  };

  const handleLeaveGroup = () => {
    if (!group) return;

    setGroups((prev) =>
      prev.map((item) => {
        if (item.id !== group.id) return item;

        return {
          ...item,
          status: "available",
          memberCount: Math.max(item.memberCount - 1, 0),
        };
      })
    );

    showNotification({
      title: "Left group",
      message: `You left ${group.name}. You can join again anytime.`,
      variant: "info",
    });
  };

  const handleJoinRide = (rideId: string) => {
    setGroupRides((prev) =>
      prev.map((ride) => {
        if (ride.id !== rideId) return ride;

        if (ride.status === "joined") {
            return ride;
        }

        return {
            ...ride,
            status: "joined",
            joinedRiders: Math.min(ride.joinedRiders + 1, ride.maxRiders),
        };
      })
    );
  };
 
  const handleOpenRideInviteModal = (rideId: string) => {
    setRideInviteModalRideId(rideId);
    setSelectedExistingRideInviteMemberIds([]);
  };

  const handleCloseRideInviteModal = () => {
    setRideInviteModalRideId(null);
    setSelectedExistingRideInviteMemberIds([]);
  };

  const toggleExistingRideInviteMember = (memberId: string) => {
    const memberOption = rideInviteModalMemberOptions.find(
      (member) => member.id === memberId
    );

    if (!memberOption || memberOption.rideInviteStatus !== "not_invited") {
      return;
    }

    setSelectedExistingRideInviteMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSendExistingRideInvites = () => {
    if (!groupId || !selectedRideForInvites) return;

    if (selectedExistingRideInviteMemberIds.length === 0) {
      showNotification({
        title: "No members selected",
        message: "Select at least one group member before sending ride invites.",
        variant: "warning",
      });

      return;
    }

    const newRideInvites: GroupRideInvite[] =
      selectedExistingRideInviteMemberIds.map((memberId) => ({
        id: `ride-invite-${selectedRideForInvites.id}-${memberId}`,
        groupId,
        rideId: selectedRideForInvites.id,
        memberId,
        status: "invited",
      }));

    setGroupRideInvites((prev) => [...prev, ...newRideInvites]);

    showNotification({
      title: "Ride invites sent",
      message: `${selectedExistingRideInviteMemberIds.length} group member${
        selectedExistingRideInviteMemberIds.length === 1 ? "" : "s"
      } invited to ${selectedRideForInvites.title}.`,
      variant: "success",
    });

    handleCloseRideInviteModal();
  };

  const toggleRideVehicleType = (vehicleType: string) => {
    setNewGroupRide((prev) => {
      const isSelected = prev.vehicleTypes.includes(vehicleType);

      return {
        ...prev,
        vehicleTypes: isSelected
          ? prev.vehicleTypes.filter((item) => item !== vehicleType)
          : [...prev.vehicleTypes, vehicleType],
      };
    });
  };

  const toggleRideInviteMember = (memberId: string) => {
    setNewGroupRide((prev) => {
      const isSelected = prev.invitedMemberIds.includes(memberId);

      return {
        ...prev,
        invitedMemberIds: isSelected
          ? prev.invitedMemberIds.filter((id) => id !== memberId)
          : [...prev.invitedMemberIds, memberId],
      };
    });
  };

  const handleCreateGroupRide = () => {
    if (!groupId) return;

    const title = newGroupRide.title.trim();
    const date = newGroupRide.date.trim();
    const time = newGroupRide.time.trim();
    const meetingPoint = newGroupRide.meetingPoint.trim();
    const trailName = newGroupRide.trailName.trim();

    if (!title) {
      alert("Please enter a ride title.");
      return;
    }

    if (!date) {
      alert("Please select a ride date.");
      return;
    }

    if (!time) {
      alert("Please select a ride time.");
      return;
    }

    if (!meetingPoint) {
      alert("Please enter a meeting point.");
      return;
    }

    if (!trailName) {
      alert("Please enter a trail or route name.");
      return;
    }

    const createdRideId = `group-ride-${Date.now()}`;

    const createdRide: GroupRide = {
      id: createdRideId,
      groupId,
      title,
      date,
      time,
      meetingPoint,
      trailName,
      difficulty: newGroupRide.difficulty,
      vehicleTypes:
        newGroupRide.vehicleTypes.length > 0
          ? newGroupRide.vehicleTypes
          : ["Dirt Bike"],
      joinedRiders: 1,
      maxRiders: Number(newGroupRide.maxRiders) || 10,
      status: "joined",
    };

    setGroupRides((prev) => [createdRide, ...prev]);

    if (newGroupRide.invitedMemberIds.length > 0) {
      const createdRideInvites: GroupRideInvite[] =
        newGroupRide.invitedMemberIds.map((memberId) => ({
          id: `ride-invite-${createdRideId}-${memberId}`,
          groupId,
          rideId: createdRideId,
          memberId,
          status: "invited",
        }));

      setGroupRideInvites((prev) => [...prev, ...createdRideInvites]);

      showNotification({
        title: "Ride invites sent",
        message: `${newGroupRide.invitedMemberIds.length} group member${
          newGroupRide.invitedMemberIds.length === 1 ? "" : "s"
        } invited to ${title}.`,
        variant: "success",
      });
    } else {
      showNotification({
        title: "Ride created",
        message: `${title} was added to this group's upcoming rides.`,
        variant: "success",
      });
    }

    setNewGroupRide({
      title: "",
      date: "",
      time: "",
      meetingPoint: "",
      trailName: "",
      difficulty: "Intermediate",
      vehicleTypes: [],
      maxRiders: 10,
      invitedMemberIds: [],
    });

    setIsCreateRideOpen(false);
  };

  const getMemberRoleClass = (role: string) => {
    if (role === "Owner") {
      return "border-yellow-500/20 bg-yellow-500/15 text-yellow-400";
    }

    if (role === "Admin") {
      return "border-purple-500/20 bg-purple-500/15 text-purple-400";
    }

    if (role === "Ride Leader") {
      return "border-orange-500/20 bg-orange-500/15 text-orange-400";
    }

    if (role === "Trail Scout") {
      return "border-cyan-500/20 bg-cyan-500/15 text-cyan-400";
    }

    return "border-neutral-700 bg-neutral-900 text-neutral-400";
  };

  const getMemberRoleLabel = (role: string) => {
    if (role === "Group Member") return "Member";
    return role;
  };

  const renderRideInvites = (ride: GroupRide) => {
    const rideInviteRows = getRideInviteMemberRows(ride.id);
    const rideInviteCounts = getRideInviteCounts(ride.id);

    if (rideInviteRows.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-300">
              Ride Invites
            </p>

            <p className="mt-0.5 text-xs text-neutral-500">
              {rideInviteRows.length} invited
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-1.5">
            {rideInviteCounts.invited > 0 && (
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                {rideInviteCounts.invited} pending
              </span>
            )}

            {rideInviteCounts.accepted > 0 && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                {rideInviteCounts.accepted} accepted
              </span>
            )}

            {rideInviteCounts.declined > 0 && (
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                {rideInviteCounts.declined} declined
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-hidden">
          {rideInviteRows.slice(0, 6).map(({ invite, member }) => (
            <div
              key={invite.id}
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-bold text-white ${
                invite.status === "accepted"
                  ? "border-emerald-500/40 bg-emerald-500/20"
                  : invite.status === "declined"
                  ? "border-red-500/40 bg-red-500/20"
                  : "border-orange-500/40 bg-orange-500/20"
              }`}
              title={`${member.name} - ${getRideInviteStatusLabel(invite.status)}`}
            >
              {member.avatar}
            </div>
          ))}

          {rideInviteRows.length > 6 && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-[10px] font-semibold text-neutral-400">
              +{rideInviteRows.length - 6}
            </div>
          )}

          <Link
            to={`/friends/groups/${ride.groupId}/rides/${ride.id}`}
            className="ml-auto flex-shrink-0 text-xs font-semibold text-orange-400 hover:text-orange-300"
          >
            Manage
          </Link>
        </div>
      </div>
    );
  };

  if (!group) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6 text-white">
        <Link to="/friends">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
          <p className="text-base font-semibold text-white">Group not found</p>
          <p className="mt-2 text-sm text-neutral-400">
            This riding group could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">

      {/* Hero */}
      <div className="relative">
        <div className="h-56 w-full overflow-hidden">
          <img
            src={group.image}
            alt={group.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-neutral-950" />

        <div className="absolute left-4 top-4 z-10">
            <Link to="/friends">
                <button className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/80">
                    <ArrowLeft className="h-4 w-4" />
                </button>
            </Link>
        </div>

        <div className="absolute -bottom-16 left-0 w-full px-4">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
              <Users className="h-9 w-9 text-orange-400" />
            </div>

            <div className="min-w-0 flex-1 pb-2">
              <h1 className="truncate text-2xl font-bold text-white">
                {group.name}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
                <MapPin className="h-4 w-4 text-neutral-500" />
                Riding group
              </p>
            </div>

            <div className="pb-2">
              {group.status === "joined" ? (
                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                  Joined
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
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
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Members</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {displayedMemberCount}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium">Upcoming</span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {displayedUpcomingRideCount}
            </p>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">About Group</h2>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {group.description}
          </p>
        </div>

        {/* Announcements */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Announcements
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Important updates from this group.
              </p>
            </div>

            <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300">
              {mockGroupAnnouncements.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {mockGroupAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {announcement.title}
                      </p>

                      <span className="flex-shrink-0 text-xs text-neutral-500">
                        {announcement.date}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Rules */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Group Rules</h2>

              <p className="mt-1 text-sm text-neutral-400">
                Basic rules to keep group rides safe and respectful.
              </p>
            </div>

            <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300">
              {mockGroupRules.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {mockGroupRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{rule.title}</p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Members */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-start justify-between gap-3">
            <div>
            <h2 className="text-base font-semibold text-white">Group Members</h2>

            <p className="mt-1 text-sm text-neutral-400">
                Riders currently connected to this group.
            </p>
            </div>

            <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300">
            {displayedMemberCount}
            </span>
        </div>

        <div className="mt-4 space-y-3">
            {visibleGroupMembers.map((member) => (
            <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
            >
                <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-sm font-bold text-white">
                {member.avatar}

                {member.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-500" />
                )}
                </div>

                <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                    </p>

                    {member.id === "member-you" && (
                    <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                        You
                    </span>
                    )}
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                    {member.role} • {member.vehicleType}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getMemberRoleClass(
                      member.role
                    )}`}
                  >
                    {getMemberRoleLabel(member.role)}
                  </span>

                  <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                    {member.vehicleType}
                  </span>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>

        {/* Group actions */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Group Actions</h2>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={group.status === "joined" ? handleLeaveGroup : handleJoinGroup}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                group.status === "joined"
                  ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15"
                  : "bg-orange-500 text-black hover:bg-orange-400"
              }`}
            >
              {group.status === "joined" ? (
                <>
                  <X className="h-4 w-4" />
                  Leave Group
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Join Group
                </>
              )}
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Message Group
            </button>
            <button
              type="button"
              onClick={() => setIsInviteFriendsOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <UserPlus className="h-4 w-4" />
              Invite Friends
              {pendingInviteCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-black">
                  {pendingInviteCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pending Invites */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Pending Invites</h2>

              <p className="mt-1 text-sm text-neutral-400">
                Riders invited to join this group.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                {pendingInviteCount} pending
              </span>

              {acceptedInviteCount > 0 && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  {acceptedInviteCount} joined
                </span>
              )}
            </div>
          </div>

          {pendingInvites.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">No pending invites</p>

              <p className="mt-2 text-sm text-neutral-400">
                Invite friends to grow this group.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingInvites.map((rider) => (
                <div
                  key={rider.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
                >
                  <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-sm font-bold text-white">
                    {rider.avatar}

                    {rider.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {rider.name}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {rider.vehicleType} • {rider.location}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkInviteJoined(rider.id)}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/15"
                    >
                      Mark Joined
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancelInvite(rider.id)}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/15"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming rides */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Upcoming Rides</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Planned rides for this group.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-medium text-neutral-300">
                  {displayedUpcomingRideCount}
                </span>

                <button
                  type="button"
                  onClick={() => setIsCreateRideOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-black transition hover:bg-orange-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </button>
              </div>
            </div>

            {visibleGroupRides.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">No rides planned yet</p>

              <p className="mt-2 text-sm text-neutral-400">
                This group does not have upcoming rides yet.
              </p>
            </div>
            ) : (
            <div className="mt-4 space-y-3">
            {visibleGroupRides.map((ride) => (
                <div
                key={ride.id}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                    <Route className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                              {ride.title}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                              {ride.trailName}
                          </p>
                          </div>

                          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                          {ride.difficulty}
                          </span>
                      </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-neutral-900 px-3 py-2">
                          <div className="flex items-center gap-2 text-neutral-500">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <p className="text-[10px] uppercase tracking-wide">
                              Date
                              </p>
                          </div>

                          <p className="mt-1 text-xs font-medium text-white">
                              {ride.date} at {ride.time}
                          </p>
                        </div>

                        <div className="rounded-xl bg-neutral-900 px-3 py-2">
                          <div className="flex items-center gap-2 text-neutral-500">
                              <Users className="h-3.5 w-3.5" />
                              <p className="text-[10px] uppercase tracking-wide">
                              Riders
                              </p>
                          </div>

                          <p className="mt-1 text-xs font-medium text-white">
                              {ride.joinedRiders}/{ride.maxRiders}
                          </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{ride.meetingPoint}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {ride.vehicleTypes.map((vehicleType) => (
                        <span
                            key={vehicleType}
                            className="rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300"
                        >
                            {vehicleType}
                        </span>
                        ))}
                    </div>
                    
                    <Link
                      to={`/friends/groups/${group.id}/rides/${ride.id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2.5 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                    >
                      <Route className="h-4 w-4" />
                      View Ride Details
                    </Link>

                    {renderRideInvites(ride)}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRideInviteModal(ride.id)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 px-3 py-2.5 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                        >
                          <UserPlus className="h-4 w-4" />
                          Invite More
                        </button>

                        <button
                          type="button"
                          onClick={() => handleJoinRide(ride.id)}
                          disabled={ride.status === "joined"}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                            ride.status === "joined"
                              ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                              : "bg-orange-500 text-black hover:bg-orange-400"
                          }`}
                        >
                          {ride.status === "joined" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Joined
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Join
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
            </div>
        )}
        </div>

        {/* Group style */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Group Style</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Mountain className="h-4 w-4" />
                <p className="text-xs">Terrain</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                Mixed off-road
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Users className="h-4 w-4" />
                <p className="text-xs">Access</p>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                Group rides
              </p>
            </div>
          </div>
        </div>
      </div>

      {isInviteFriendsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsInviteFriendsOpen(false)}
        >
          <div
            className="flex max-h-[82vh] w-full max-w-[390px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Group Invites
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Invite Friends
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Select riders to invite into this group.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteFriendsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="modal-scrollbar mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
              {visibleInviteCandidates.map((candidate) => {
                const isSelected = selectedInviteRiderIds.includes(candidate.id);
                const isAlreadyInvited = candidate.status === "invited";
                const isAlreadyJoined = candidate.status === "joined";
                const isDisabled = isAlreadyInvited || isAlreadyJoined;

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleInviteSelection(candidate.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-orange-500/40 bg-orange-500/15"
                        : isDisabled
                        ? "border-neutral-800 bg-neutral-900/70 opacity-75"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                    }`}
                  >
                    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-sm font-bold text-white">
                      {candidate.avatar}

                      {candidate.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {candidate.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {candidate.vehicleType} • {candidate.location}
                      </p>
                    </div>

                    {isAlreadyJoined ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Joined
                      </span>
                    ) : isAlreadyInvited ? (
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400">
                        Invited
                      </span>
                    ) : (
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-black"
                            : "border-neutral-700 text-neutral-500"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedInviteRiderIds([]);
                  setIsInviteFriendsOpen(false);
                }}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendInvites}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                <Send className="h-4 w-4" />
                Send
                {selectedInviteCount > 0 && ` (${selectedInviteCount})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRideForInvites && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={handleCloseRideInviteModal}
        >
          <div
            className="flex max-h-[82vh] w-full max-w-[390px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-300">
                  Ride Invites
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Invite More Members
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Select group members to invite to {selectedRideForInvites.title}.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseRideInviteModal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="modal-scrollbar mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
              {rideInviteModalMemberOptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900 px-4 py-5 text-center">
                  <p className="text-sm font-medium text-white">
                    No members available
                  </p>

                  <p className="mt-2 text-sm text-neutral-500">
                    Add members to this group before inviting them to a ride.
                  </p>
                </div>
              ) : (
                rideInviteModalMemberOptions.map((member) => {
                  const isSelected = selectedExistingRideInviteMemberIds.includes(
                    member.id
                  );

                  const isDisabled = member.rideInviteStatus !== "not_invited";

                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleExistingRideInviteMember(member.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-orange-500/40 bg-orange-500/15"
                          : isDisabled
                          ? "border-neutral-800 bg-neutral-900/70 opacity-75"
                          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                      }`}
                    >
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

                      {member.rideInviteStatus !== "not_invited" ? (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRideInviteStatusClass(
                            member.rideInviteStatus
                          )}`}
                        >
                          {getRideInviteStatusLabel(member.rideInviteStatus)}
                        </span>
                      ) : (
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-black"
                              : "border-neutral-700 text-neutral-500"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex shrink-0 gap-3">
              <button
                type="button"
                onClick={handleCloseRideInviteModal}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendExistingRideInvites}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                <Send className="h-4 w-4" />
                Send
                {selectedExistingRideInviteMemberIds.length > 0 &&
                  ` (${selectedExistingRideInviteMemberIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateRideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsCreateRideOpen(false)}
        >
          <div
            className="flex max-h-[82vh] w-full max-w-[390px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Group Ride
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Create Group Ride
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Plan a ride for this group with date, route, meeting point,
                  and vehicle details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateRideOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="modal-scrollbar mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Ride title
                </label>

                <input
                  type="text"
                  value={newGroupRide.title}
                  onChange={(event) =>
                    setNewGroupRide((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Example: Sunday Forest Loop"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Date
                  </label>

                  <input
                    type="date"
                    value={newGroupRide.date}
                    onChange={(event) =>
                      setNewGroupRide((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Time
                  </label>

                  <input
                    type="time"
                    value={newGroupRide.time}
                    onChange={(event) =>
                      setNewGroupRide((prev) => ({
                        ...prev,
                        time: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Meeting point
                </label>

                <input
                  type="text"
                  value={newGroupRide.meetingPoint}
                  onChange={(event) =>
                    setNewGroupRide((prev) => ({
                      ...prev,
                      meetingPoint: event.target.value,
                    }))
                  }
                  placeholder="Example: Cape Town Shell Garage"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Trail / route name
                </label>

                <input
                  type="text"
                  value={newGroupRide.trailName}
                  onChange={(event) =>
                    setNewGroupRide((prev) => ({
                      ...prev,
                      trailName: event.target.value,
                    }))
                  }
                  placeholder="Example: Forest Ridge Trail"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Difficulty
                </label>

                <select
                  value={newGroupRide.difficulty}
                  onChange={(event) =>
                    setNewGroupRide((prev) => ({
                      ...prev,
                      difficulty: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                >
                  {rideDifficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Max riders
                </label>

                <input
                  type="number"
                  min="1"
                  value={newGroupRide.maxRiders}
                  onChange={(event) =>
                    setNewGroupRide((prev) => ({
                      ...prev,
                      maxRiders: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Vehicle types
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {rideVehicleTypeOptions.map((vehicleType) => {
                    const isSelected =
                      newGroupRide.vehicleTypes.includes(vehicleType);

                    return (
                      <button
                        key={vehicleType}
                        type="button"
                        onClick={() => toggleRideVehicleType(vehicleType)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                          isSelected
                            ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                            : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {vehicleType}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Choose one or more vehicle types for this ride.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-neutral-300">
                  Invite group members
                </label>

                <span className="rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-400">
                  {newGroupRide.invitedMemberIds.length} selected
                </span>
              </div>

              <div className="mt-2 space-y-2">
                {rideInviteMemberOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900 px-4 py-4 text-center">
                    <p className="text-sm font-medium text-white">
                      No members to invite yet
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Add riders to the group before inviting them to a ride.
                    </p>
                  </div>
                ) : (
                  rideInviteMemberOptions.map((member) => {
                    const isSelected = newGroupRide.invitedMemberIds.includes(member.id);

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleRideInviteMember(member.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-orange-500/40 bg-orange-500/15"
                            : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                        }`}
                      >
                        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white">
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
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-black"
                              : "border-neutral-700 text-neutral-500"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Selected members will receive a ride invite when this ride is created.
              </p>
            </div>

            <div className="mt-5 flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setIsCreateRideOpen(false)}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateGroupRide}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                Create Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}