import { useEffect, useState } from 'react';
import { getListings, type Listing } from '../lib/api';

export default function DiscoverPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-padding">
      <h2>Discover</h2>
      <p className="section-subtitle--lg">Browse pieces by category, fit, and event type.</p>

      {loading && <p>Loading listings...</p>}
      {error && <p className="text-error">{error}</p>}

      <div className="discover-grid">
        {listings.map((listing) => {
          const id = listing.listing_id ?? listing.id;
          return (
            <div key={id} className="discover-card">
              {listing.image_url ? (
                <img
                  src={listing.image_url}
                  alt={listing.title}
                  className="discover-card-img"
                />
              ) : (
                <div className="discover-card-no-img">No Image</div>
              )}
              <div className="discover-card-body">
                <h3>{listing.title}</h3>
                {listing.category && (
                  <p className="discover-card-category">{listing.category}</p>
                )}
                <p className="discover-card-price">${listing.price_per_day}/day</p>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && !error && listings.length === 0 && (
        <p className="text-muted">No listings yet.</p>
      )}
    </div>
  );
}
