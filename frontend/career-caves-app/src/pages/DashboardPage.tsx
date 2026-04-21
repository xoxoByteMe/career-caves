import { useEffect, useState } from 'react';
import type { Rental } from '../app/routes';
import { getListings, type Listing } from '../lib/api';
import ListingDetailsModal from '../components/ListingDetailsModal';

interface DashboardPageProps {
  rentals: Rental[];
}

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

interface WeatherSummary {
  locationLabel: string;
  minTempF: number;
  maxTempF: number;
  currentTempF: number;
  asOfTime: string;
}

const weatherLocation = {
  label: 'Gainesville, FL',
  latitude: 29.6516,
  longitude: -82.3248,
};

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function getClosestTemperatureIndex(timestamps: string[]): number {
  const now = Date.now();
  let closestIndex = 0;
  let smallestDifference = Number.POSITIVE_INFINITY;

  timestamps.forEach((timeValue, index) => {
    const difference = Math.abs(new Date(timeValue).getTime() - now);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function formatAsOfTime(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DashboardPage({ rentals }: DashboardPageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      setIsLoadingWeather(true);
      setWeatherError(null);

      // API requirement 
      const endpoint = 'https://api.open-meteo.com/v1/forecast';
      const params = new URLSearchParams({
        latitude: weatherLocation.latitude.toString(),
        longitude: weatherLocation.longitude.toString(),
        hourly: 'temperature_2m',
        forecast_days: '1',
        timezone: 'auto',
      });

      try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Weather request failed (${response.status})`);
        }

        const payload = (await response.json()) as OpenMeteoResponse;
        const times = payload.hourly?.time ?? [];
        const temperatures = payload.hourly?.temperature_2m ?? [];

        if (times.length === 0 || temperatures.length === 0) {
          throw new Error('Weather data is unavailable right now.');
        }

        const closestIndex = getClosestTemperatureIndex(times);
        const minTempC = Math.min(...temperatures);
        const maxTempC = Math.max(...temperatures);

        if (isMounted) {
          setWeather({
            locationLabel: weatherLocation.label,
            minTempF: celsiusToFahrenheit(minTempC),
            maxTempF: celsiusToFahrenheit(maxTempC),
            currentTempF: celsiusToFahrenheit(temperatures[closestIndex]),
            asOfTime: formatAsOfTime(times[closestIndex]),
          });
        }
      } catch (error) {
        if (isMounted) {
          setWeatherError(error instanceof Error ? error.message : 'Could not load weather forecast.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingWeather(false);
        }
      }
    }

    void loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredListings =
    normalizedQuery.length === 0
      ? listings
      : listings.filter((listing) => {
          const haystack = [
            listing.title,
            listing.category ?? '',
            listing.size ?? '',
            listing.condition ?? '',
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalizedQuery);
        });

  return (
    <>
      <header className="dashboard-header">
        <input
          type="text"
          placeholder="Search by event, size, or type..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      <section className="weather-section" aria-label="Current day weather forecast">
        <div className="weather-card">
          <div className="weather-card__left">
            <p className="weather-eyebrow">Today&apos;s weather</p>
            {isLoadingWeather && <p className="weather-status">Loading forecast...</p>}
            {weatherError && !isLoadingWeather && <p className="text-error">{weatherError}</p>}
            {weather && !isLoadingWeather && !weatherError && (
              <>
                <h3 className="weather-location">{weather.locationLabel}</h3>
                <p className="weather-current">{Math.round(weather.currentTempF)}°F</p>
                <p className="weather-updated">As of {weather.asOfTime}</p>
              </>
            )}
          </div>

          {weather && !isLoadingWeather && !weatherError && (
            <div className="weather-card__right" aria-label="Daily temperature range">
              <div className="weather-stat">
                <span className="weather-stat__label">Low</span>
                <span className="weather-stat__value">{Math.round(weather.minTempF)}°F</span>
              </div>
              <div className="weather-stat">
                <span className="weather-stat__label">High</span>
                <span className="weather-stat__value">{Math.round(weather.maxTempF)}°F</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rental-carousel">
        <h2>Your Rentals</h2>
        {rentals.map((r) => (
          <div key={r.id} className="rental-card">
            <div className="rental-thumb"></div>
            <div>
              <span
                className={`rental-status ${
                  r.status === 'ACTIVE'
                    ? 'rental-status--active'
                    : r.status === 'CONFIRMED'
                      ? 'rental-status--confirmed'
                      : 'rental-status--default'
                }`}
              >
                <span className="status-dot"></span> {r.status}
              </span>
              <h4 className="rental-item-title">{r.item}</h4>
              <p className="rental-item-time">{r.timeLeft}</p>
            </div>
          </div>
        ))}
        <button className="view-all-btn">View All</button>
      </section>

      <div className="trending-section">
        <h2>Trending for Career Week</h2>

        {isLoadingListings && <p className="text-muted">Loading listings...</p>}
        {listingsError && <p className="text-error">Could not load listings: {listingsError}</p>}

        <div className="listings-grid">
          {!isLoadingListings && !listingsError && listings.length === 0 && (
            <p className="text-muted">No listings yet. Add one from the Lending page.</p>
          )}

          {!isLoadingListings && !listingsError && listings.length > 0 && filteredListings.length === 0 && (
            <p className="text-muted">No results for "{searchQuery.trim()}".</p>
          )}

          {filteredListings.map((listing) => (
            <div
              key={listing.listing_id ?? listing.id ?? `${listing.title}-${listing.price_per_day}`}
              className="listing-card"
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
                  className="listing-img"
                />
              ) : (
                <div className="listing-no-img">No Image</div>
              )}
              <div className="listing-meta">
                <h4>{listing.title} - ${listing.price_per_day}/day</h4>
                <span>{listing.category ?? 'General'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ListingDetailsModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />

      <div className="ticks"></div>

      <footer className="info-grid">
        <div className="info-box">
          <h3>Reputation Center</h3>
          <p className="info-text">
            UF Student verification ensures a safe marketplace for all Gators.
          </p>
          <div className="rating-badges">
            <span className="rating-badge">Punctuality: 5.0 star</span>
            <span className="rating-badge">Cleanliness: 4.9 star</span>
          </div>
        </div>
        <div className="info-box">
          <h3>Secure Exchange</h3>
          <p className="info-text">
            Rental insurance and security deposits are handled in Escrow via Stripe.
          </p>
        </div>
      </footer>
    </>
  );
}
