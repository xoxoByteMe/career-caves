import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  
  // MOCK DATA: Replace this state with a Supabase auth hook 
  // (e.g., const { user } = useAuth(); )
  const [profile, setProfile] = useState({
    name: 'Esther Olatunji',
    email: 'esther@ufl.edu',
    avatarUrl: 'https://ui-avatars.com/api/?name=Esther+Olatunji&background=C154C1&color=fff',
    isUFVerified: true,
    joinDate: 'August 2025',
    measurements: {
      topSize: 'M',
      bottomSize: '8',
      shoeSize: '8.5',
      height: "5'6\"",
    },
    stats: { rating: 4.9, rentalsCompleted: 12, itemsListed: 4 }
  });

  // Temporary state for the edit form so we can cancel without saving
  const [editForm, setEditForm] = useState(profile.measurements);
  const [editName, setEditName] = useState(profile.name);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      name: editName,
      measurements: editForm
    });
    setIsEditing(false);
  };

  return (
    <div className="page-padding profile-page">
      <div className="profile-header">
        <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" />
        <div className="profile-info">
          <h2>{profile.name}</h2>
          <p className="text-muted">{profile.email} • Joined {profile.joinDate}</p>
          {profile.isUFVerified && (
            <span className="verified-badge" style={{ marginTop: '8px', display: 'inline-block' }}>✓ UF Verified</span>
          )}
        </div>
        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-box"><h3>{profile.stats.rating} ⭐️</h3><p>Average Rating</p></div>
        <div className="stat-box"><h3>{profile.stats.rentalsCompleted}</h3><p>Rentals Completed</p></div>
        <div className="stat-box"><h3>{profile.stats.itemsListed}</h3><p>Items Listed</p></div>
      </div>

      <div className="profile-sections-grid">
        {/* Dynamic Activity Cards */}
        <section className="profile-card">
          <div className="card-header">
            <h3>My Activity</h3>
          </div>
          <div className="activity-list">
            <NavLink to="/" className="activity-row">
              <div className="activity-icon" style={{ background: '#eef2ff' }}>🛍️</div>
              <div className="activity-text">
                <h4>Active Rentals (2)</h4>
                <p>Navy Slim-Fit Suit, Black Loafers</p>
              </div>
              <span className="arrow">→</span>
            </NavLink>
            <NavLink to="/lending" className="activity-row">
              <div className="activity-icon" style={{ background: '#fdf4ff' }}>🏷️</div>
              <div className="activity-text">
                <h4>My Listings (4)</h4>
                <p>Manage your closet</p>
              </div>
              <span className="arrow">→</span>
            </NavLink>
            <NavLink to="/discover" className="activity-row">
              <div className="activity-icon" style={{ background: '#fffbeb' }}>❤️</div>
              <div className="activity-text">
                <h4>Favorites (12)</h4>
                <p>Items you've saved for later</p>
              </div>
              <span className="arrow">→</span>
            </NavLink>
          </div>
        </section>

        {/* Settings & Help */}
        <section className="profile-card">
          <div className="card-header">
            <h3>Settings</h3>
          </div>
          <div className="settings-list">
            <button className="settings-btn">Notifications <span className="badge">3 New</span></button>
            <button className="settings-btn">Payment Methods</button>
            <button className="settings-btn">Privacy & Security</button>
            {/* Link this to the new HelpPage */}
            <NavLink to="/help" className="settings-btn" style={{ display: 'block', textDecoration: 'none' }}>Help & Support</NavLink>
            <button className="settings-btn text-error" style={{ marginTop: '20px' }}>Sign Out</button>
          </div>
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveProfile}>
            <h2>Edit Profile</h2>
            <p className="modal-subtitle">Update your personal details and sizing.</p>

            <div className="form-grid">
              <div className="form-group form-group--full">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tops / Jackets Size</label>
                <input className="form-input" value={editForm.topSize} onChange={(e) => setEditForm({ ...editForm, topSize: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pants / Skirts Size</label>
                <input className="form-input" value={editForm.bottomSize} onChange={(e) => setEditForm({ ...editForm, bottomSize: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Shoe Size</label>
                <input className="form-input" value={editForm.shoeSize} onChange={(e) => setEditForm({ ...editForm, shoeSize: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Height</label>
                <input className="form-input" value={editForm.height} onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn-submit">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}