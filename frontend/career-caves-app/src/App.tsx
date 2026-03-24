import { useState } from 'react';
import './App.css';

interface Rental {
  id: string;
  item: string;
  status: 'ACTIVE' | 'CONFIRMED' | 'COMPLETED';
  timeLeft: string;
}

function App() {
  const [showListForm, setShowListForm] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const [rentals] = useState<Rental[]>([
    { id: '1', item: 'Navy Slim-Fit Suit', status: 'ACTIVE', timeLeft: '24h left' },
    { id: '2', item: 'Black Patent Loafers', status: 'CONFIRMED', timeLeft: 'Starts tomorrow' },
    { id: '3', item: 'Grey Tailored Blazer', status: 'COMPLETED', timeLeft: 'Returned 2d ago' },
  ]);

  return (
    <div className="app-container">
      {/* 1. Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo-text">Gator Closet</h1>
          <div className="verified-badge">UF Verified</div>
        </div>

        <div className="nav-group">
          {['Dashboard', 'Discover', 'Messages', 'Profile'].map((tab) => (
            <button 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="persona-toggle">
          <button className="toggle-btn active">Renting</button>
          <button className="toggle-btn">Lending</button>
       </div>
      </nav>

      <main className="main-content">
        {/* 2. Header */}
        <header style={{ minHeight: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <input 
            type="text" 
            placeholder="Search by event, size, or type..." 
            style={{ flex: '1 1 320px', maxWidth: '520px', minWidth: '220px', padding: '10px 20px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
          />
          <button 
            onClick={() => setShowListForm(true)}
            style={{ background: 'var(--ufl-orange)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', flexShrink: 0 }}
          >
            List an Item
          </button>
        </header>

        {/* 3. Global Rental Preview (IA Requirement: Persistent Status) */}
        <section className="rental-carousel">
          <h2>Your Rentals</h2>
          {rentals.map((r) => (
            <div key={r.id} className="rental-card">
              <div style={{ background: 'var(--border-color)', height: '40px', width: '40px', borderRadius: '6px', flexShrink: 0 }}></div>
              <div>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: r.status === 'ACTIVE' ? 'var(--status-active)' : r.status === 'CONFIRMED' ? 'var(--status-confirmed)' : 'var(--text-muted)' 
                }}>
                  <span className="status-dot" style={{ background: 'currentColor' }}></span> {r.status}
                </span>
                <h4 style={{ fontSize: '14px', margin: '2px 0' }}>{r.item}</h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{r.timeLeft}</p>
              </div>
            </div>
          ))}
          <button style={{ border: 'none', background: 'none', color: 'var(--ufl-blue)', fontWeight: 'bold', minWidth: '100px' }}>
            View All
          </button>
        </section>

        {/* 4. Visual Feed */}
        <div style={{ padding: '40px 32px' }}>
          <h2 style={{ marginBottom: '24px' }}>Trending for Career Week</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="listing-card">
                <div style={{ height: '280px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '12px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px' }}>Tailored Piece • $15/day</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0.5 mi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ticks"></div>

        {/* 5. Footer Info Grid */}
        <footer className="info-grid">
          <div className="info-box">
            <h3>Reputation Center</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>UF Student verification ensures a safe marketplace for all Gators.</p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px' }}>Punctuality: 5.0 ⭐</span>
              <span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px' }}>Cleanliness: 4.9 ⭐</span>
            </div>
          </div>
          <div className="info-box">
            <h3>Secure Exchange</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Rental insurance and security deposits are handled in Escrow via Stripe.</p>
          </div>
        </footer>
      </main>

      {/* 6. List Item Modal */}
      {showListForm && (
        <div className="modal-overlay" onClick={() => setShowListForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>List a Professional Item</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Provide measurements to help other Gators find the perfect fit.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Item Title</label>
                <input className="form-input" placeholder="e.g. Zara Tailored Blazer" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Price per Day ($)</label>
                <input className="form-input" type="number" placeholder="15" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Chest (in)</label>
                <input className="form-input" placeholder="40" />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Your Height</label>
                <input className="form-input" placeholder="5'10\" />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setShowListForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none' }}>Cancel</button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--ufl-blue)', color: 'white', border: 'none', fontWeight: 'bold' }}>Post Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;