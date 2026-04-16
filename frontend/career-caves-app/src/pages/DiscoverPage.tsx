import { useEffect, useState } from 'react';
import { getListings, type Listing } from '../lib/api';
import ListingDetailsModal from '../components/ListingDetailsModal';

export default function DiscoverPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  // Get unique categories and conditions for filter dropdowns
  const categories = Array.from(
    new Set(listings.map((l) => l.category).filter((c): c is string => c !== null && c !== undefined)),
  );
  const conditions = Array.from(
    new Set(listings.map((l) => l.condition).filter((c): c is string => c !== null && c !== undefined)),
  );

  // Filter listings based on selected filters
  const filteredListings = listings.filter((listing) => {
    const categoryMatch = !selectedCategory || listing.category === selectedCategory;
    const conditionMatch = !selectedCondition || listing.condition === selectedCondition;
    const minPriceMatch = !minPrice || listing.price_per_day >= Number(minPrice);
    const maxPriceMatch = !maxPrice || listing.price_per_day <= Number(maxPrice);
    return categoryMatch && conditionMatch && minPriceMatch && maxPriceMatch;
  });

  return (
    <div className="page-padding">
      <h2>Discover</h2>
      <p className="section-subtitle--lg">Browse pieces by category, fit, and event type.</p>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="condition-filter">Condition</label>
          <select
            id="condition-filter"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="filter-select"
          >
            <option value="">All Conditions</option>
            {conditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="min-price">Min Price ($)</label>
          <input
            id="min-price"
            type="number"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="max-price">Max Price ($)</label>
          <input
            id="max-price"
            type="number"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
            className="filter-input"
          />
        </div>

        {(selectedCategory || selectedCondition || minPrice || maxPrice) && (
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedCondition('');
              setMinPrice('');
              setMaxPrice('');
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && <p>Loading listings...</p>}
      {error && <p className="text-error">{error}</p>}

      <div className="discover-grid">
        {filteredListings.map((listing) => {
          const id = listing.listing_id ?? listing.id;
          return (
            <div
              key={id}
              className="discover-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedListing(listing)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedListing(listing);
                }
              }}
            >
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

      {!loading && !error && filteredListings.length === 0 && (
        <p className="text-muted">
          {listings.length === 0 ? 'No listings yet.' : 'No listings match your filters.'}
        </p>
      )}

      <ListingDetailsModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
}
