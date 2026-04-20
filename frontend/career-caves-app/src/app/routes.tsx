import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage.tsx';
import DiscoverPage from '../pages/DiscoverPage.tsx';
import LendingPage from '../pages/LendingPage.tsx';
import MessagesPage from '../pages/MessagesPage.tsx';
import ProfilePage from '../pages/ProfilePage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import SignupPage from '../pages/SignupPage.tsx';
import ProtectedRoute from '../components/ProtectedRoute.tsx';

export interface Rental {
  id: string;
  item: string;
  status: 'ACTIVE' | 'CONFIRMED' | 'COMPLETED';
  timeLeft: string;
}

interface AppRoutesProps {
  rentals: Rental[];
}

export default function AppRoutes({ rentals }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/" element={<ProtectedRoute><DashboardPage rentals={rentals} /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
      <Route path="/lending" element={<ProtectedRoute><LendingPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
