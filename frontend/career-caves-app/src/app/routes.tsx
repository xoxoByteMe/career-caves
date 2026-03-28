import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage.tsx';
import DiscoverPage from '../pages/DiscoverPage.tsx';
import LendingPage from '../pages/LendingPage.tsx';
import MessagesPage from '../pages/MessagesPage.tsx';
import ProfilePage from '../pages/ProfilePage.tsx';

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
      <Route path="/" element={<DashboardPage rentals={rentals} />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/lending" element={<LendingPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
