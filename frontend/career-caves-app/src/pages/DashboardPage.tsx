import { useEffect, useState } from 'react';
import type { Rental } from '../app/routes';
import { getListings, type Listing } from '../lib/api';

interface DashboardPageProps {
  rentals: Rental[];
}

export default function DashboardPage({ rentals }: DashboardPageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setIsLoadingListings(true);
      setListingsError(null);

      try {
        const data = await getListings();
        if (isMounted) {
          setListings(data);
        }
      } catch (error) {
        if (isMounted) {
          setListingsError(error instanceof Error ? error.message : 'Failed to load listings');
        }
      } finally {
        if (isMounted) {
          setIsLoadingListings(false);
        }
      }
    }

    void loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <header
        style={{
          minHeight: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 32px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
        }}
      >
        <input
          type="text"
          placeholder="Search by event, size, or type..."
          style={{
            flex: '1 1 320px',
            maxWidth: '520px',
            minWidth: '220px',
            padding: '10px 20px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        />
      </header>

      <section className="rental-carousel">
        <h2>Your Rentals</h2>
        {rentals.map((r) => (
          <div key={r.id} className="rental-card">
            <div
              style={{
                background: 'var(--border-color)',
                height: '40px',
                width: '40px',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            ></div>
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color:
                    r.status === 'ACTIVE'
                      ? 'var(--status-active)'
                      : r.status === 'CONFIRMED'
                        ? 'var(--status-confirmed)'
                        : 'var(--text-muted)',
                }}
              >
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

      <div style={{ padding: '40px 32px' }}>
        <h2 style={{ marginBottom: '24px' }}>Trending for Career Week</h2>

        {isLoadingListings && <p style={{ color: 'var(--text-muted)' }}>Loading listings...</p>}
        {listingsError && <p style={{ color: '#b42318' }}>Could not load listings: {listingsError}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {!isLoadingListings && !listingsError && listings.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No listings yet. Add one from the Lending page.</p>
          )}

          {listings.map((listing) => (
            <div key={listing.id ?? `${listing.title}-${listing.price_per_day}`} className="listing-card">
              <div
                style={{
                  height: '280px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '12px',
                }}
              ></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px' }}>{listing.title} - ${listing.price_per_day}/day</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{listing.category ?? 'General'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ticks"></div>

      <footer className="info-grid">
        <div className="info-box">
          <h3>Reputation Center</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            UF Student verification ensures a safe marketplace for all Gators.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px' }}>
              Punctuality: 5.0 star
            </span>
            <span style={{ padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px' }}>
              Cleanliness: 4.9 star
            </span>
          </div>
        </div>
        <div className="info-box">
          <h3>Secure Exchange</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            Rental insurance and security deposits are handled in Escrow via Stripe.
          </p>
        </div>
      </footer>
    </>
  );
}
