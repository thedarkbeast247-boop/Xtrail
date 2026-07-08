import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/auth/RequireAuth";

import { Home } from "./pages/Home";
import { TrailDetail } from "./pages/TrailDetail";
import { RecordRide } from "./pages/RecordRide";
import { Subscription } from "./pages/Subscription";
import { Profile } from "./pages/Profile";
import { ServiceLog } from "./pages/ServiceLog";
import { Friends } from "./pages/Friends";
import { ProgressDashboard } from "./pages/ProgressDashboard";
import { Achievements } from "./pages/Achievements";
import { Garage } from "./pages/Garage";
import { VehicleDetail } from "./pages/VehicleDetail";
import { RideHistory } from "./pages/RideHistory";
import { RideDetail } from "./pages/RideDetail";
import { SavedTrails } from "./pages/SavedTrails";
import { CompletedTrails } from "./pages/CompletedTrails";
import { GroupDetail } from "./pages/GroupDetail";
import { RiderDetail } from "./pages/RiderDetail";
import { GroupRideDetail } from "./pages/GroupRideDetail";
import { AdminUsers } from "./pages/AdminUsers";
import { DevAccessTester } from "./pages/DevAccessTester";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";

function authPage(page: ReactNode) {
  return <Layout showBottomNav={false}>{page}</Layout>;
}

function protectedPage(page: ReactNode) {
  return (
    <RequireAuth>
      <Layout>{page}</Layout>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: () => authPage(<Login />),
  },
  {
    path: "/register",
    Component: () => authPage(<Register />),
  },
  {
    path: "/forgot-password",
    Component: () => authPage(<ForgotPassword />),
  },
  {
    path: "/",
    Component: () => protectedPage(<Home />),
  },
  {
    path: "/trail/:id",
    Component: () => protectedPage(<TrailDetail />),
  },
  {
    path: "/record",
    Component: () => protectedPage(<RecordRide />),
  },
  {
    path: "/subscription",
    Component: () => protectedPage(<Subscription />),
  },
  {
    path: "/profile",
    Component: () => protectedPage(<Profile />),
  },
  {
    path: "/service-log",
    Component: () => protectedPage(<ServiceLog />),
  },
  {
    path: "/friends",
    Component: () => protectedPage(<Friends />),
  },
  {
    path: "/friends/riders/:riderId",
    Component: () => protectedPage(<RiderDetail />),
  },
  {
    path: "/friends/groups/:groupId",
    Component: () => protectedPage(<GroupDetail />),
  },
  {
    path: "/friends/groups/:groupId/rides/:rideId",
    Component: () => protectedPage(<GroupRideDetail />),
  },
  {
    path: "/progress",
    Component: () => protectedPage(<ProgressDashboard />),
  },
  {
    path: "/achievements",
    Component: () => protectedPage(<Achievements />),
  },
  {
    path: "/garage",
    Component: () => protectedPage(<Garage />),
  },
  {
    path: "/garage/:vehicleId",
    Component: () => protectedPage(<VehicleDetail />),
  },
  {
    path: "/ride-history",
    Component: () => protectedPage(<RideHistory />),
  },
  {
    path: "/ride-history/:rideId",
    Component: () => protectedPage(<RideDetail />),
  },
  {
    path: "/saved-trails",
    Component: () => protectedPage(<SavedTrails />),
  },
  {
    path: "/completed-trails",
    Component: () => protectedPage(<CompletedTrails />),
  },
  {
    path: "/admin/users",
    Component: () => protectedPage(<AdminUsers />),
  },
  {
    path: "/dev/access-tester",
    Component: () => protectedPage(<DevAccessTester />),
  },
]);