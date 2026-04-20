import { NavLink } from 'react-router-dom';
import AppRoutes, { type Rental } from './app/routes';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  const rentals: Rental[] = [
    { id: '1', item: 'Navy Slim-Fit Suit', status: 'ACTIVE', timeLeft: '24h left' },
    { id: '2', item: 'Black Patent Loafers', status: 'CONFIRMED', timeLeft: 'Starts tomorrow' },
    { id: '3', item: 'Grey Tailored Blazer', status: 'COMPLETED', timeLeft: 'Returned 2d ago' },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AppRoutes rentals={rentals} />;
  }

  return (
    <div className="app-container">
      {/* 1. Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          {/* ADD: Logo will go here once we make one */}
          <h1 className="logo-text">Career Caves</h1>
          <div className="verified-badge">UF Verified</div>
        </div>

        <div className="nav-group">
          {[
            { label: 'Dashboard', to: '/' },
            { label: 'Discover', to: '/discover' },
            { label: 'Messages', to: '/messages' },
            { label: 'Profile', to: '/profile' },
          ].map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="persona-toggle">
          <NavLink to="/" end className={({ isActive }) => `toggle-btn toggle-link ${isActive ? 'active' : ''}`}>
            Renting
          </NavLink>
          <NavLink to="/lending" className={({ isActive }) => `toggle-btn toggle-link ${isActive ? 'active' : ''}`}>
            Lending
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        <AppRoutes rentals={rentals} />
      </main>
    </div>
  );
}

export default App;
