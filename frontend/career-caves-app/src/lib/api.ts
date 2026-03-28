export interface Listing {
  id?: string;
  title: string;
  price_per_day: number;
  category?: string | null;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { data?: T; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed');
  }

  if (payload.data === undefined) {
    throw new Error('Response did not include data');
  }

  return payload.data;
}

export async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${apiBaseUrl}/api/listings`);
  return parseJsonResponse<Listing[]>(response);
}

export async function createListing(input: {
  title: string;
  pricePerDay: number;
  category?: string;
}): Promise<Listing> {
  const response = await fetch(`${apiBaseUrl}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseJsonResponse<Listing>(response);
}
