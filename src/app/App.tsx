import { RouterProvider } from 'react-router';
import { NotificationProvider } from './context/NotificationContext';
import { router } from './routes';

export default function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}