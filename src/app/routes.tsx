import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TrailDetail } from './pages/TrailDetail';
import { RecordRide } from './pages/RecordRide';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';

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
]);
