import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TrailDetail } from './pages/TrailDetail';
import { RecordRide } from './pages/RecordRide';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';
import { ServiceLog } from './pages/ServiceLog';
import { Friends } from './pages/Friends';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { Achievements } from './pages/Achievements';
import { Garage } from './pages/Garage';
import { VehicleDetail } from './pages/VehicleDetail';
import { RideHistory } from './pages/RideHistory';
import { RideDetail } from './pages/RideDetail';
import { SavedTrails } from './pages/SavedTrails';
import { CompletedTrails } from './pages/CompletedTrails';


export const router = createBrowserRouter([
  {
    path: '/',
    Component: () => (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: '/trail/:id',
    Component: () => (
      <Layout>
        <TrailDetail />
      </Layout>
    ),
  },
  {
    path: '/record',
    Component: () => (
      <Layout>
        <RecordRide />
      </Layout>
    ),
  },
  {
    path: '/subscription',
    Component: () => (
      <Layout>
        <Subscription />
      </Layout>
    ),
  },
  {
    path: '/profile',
    Component: () => (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
  {
    path: '/service-log',
    Component: () => (
      <Layout>
        <ServiceLog />
      </Layout>
    ),
  },
  {
    path: '/friends',
    Component: () => (
      <Layout>
        <Friends />
      </Layout>
    ),
  },
  {
    path: '/progress',
    Component: () => (
      <Layout>
        <ProgressDashboard />
      </Layout>
    ),
  },
  {
    path: '/achievements',
    Component: () => (
      <Layout>
        <Achievements />
      </Layout>
    ),
  },
  {
    path: '/garage',
    Component: () => (
      <Layout>
        <Garage />
      </Layout>
    ),
  },
  {
    path: '/garage/:vehicleId',
    Component: () => (
      <Layout>
        <VehicleDetail />
      </Layout>
    ),
  },
  {
    path: '/ride-history',
    Component: () => (
      <Layout>
        <RideHistory />
      </Layout>
    ),
  },
  {
    path: '/ride-history/:rideId',
    Component: () => (
      <Layout>
        <RideDetail />
      </Layout>
    ),
  },
  {
    path: '/saved-trails',
    Component: () => (
      <Layout>
        <SavedTrails />
      </Layout>
    ),
  },
  {
    path: '/completed-trails',
    Component: () => (
      <Layout>
        <CompletedTrails />
      </Layout>
    ),
  },
]);
