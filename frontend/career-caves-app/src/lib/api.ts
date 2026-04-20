import { supabase } from './supabaseClient';

export interface Listing {
  listing_id?: number;
  id?: number;
  user_id?: number;
  name?: string | null;
  email?: string | null;
  title: string;
  price_per_day: number;
  category?: string | null;
  condition?: string | null;
  size?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;
}

export interface Conversation {
  conversation_id: number;
  listing_id: number;
  user1_id: number;
  user2_id: number;
  created_at?: string | null;
}

export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').trim();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not Authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawBody = await response.text();
  let payload: { data?: T; error?: string };

  try {
    payload = JSON.parse(rawBody) as { data?: T; error?: string };
  } catch {
    const preview = rawBody.slice(0, 120).replace(/\s+/g, ' ').trim();
    throw new Error(`Expected JSON from API but received non-JSON response (${response.status} ${response.statusText}): ${preview}`);
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed');
  }

  if (payload.data === undefined) {
    throw new Error('Response did not include data');
  }

  return payload.data;
}

// listingsRouter.get('/', async (_req, res) => {
export async function getListings(options?: { mine?: boolean }): Promise<Listing[]> {
  const authHeaders = await getAuthHeaders();
  const searchParams = new URLSearchParams();

  if (options?.mine) {
    searchParams.set('mine', 'true');
  }

  const queryString = searchParams.toString();
  const response = await fetch(`${apiBaseUrl}/api/listings${queryString ? `?${queryString}` : ''}`, {
    headers: authHeaders,
  });
  return parseJsonResponse<Listing[]>(response);
}

// listingsRouter.post('/', async (req, res) => {
// user_id is set to 1 for now since we don't have login set up, but we'll want to include it in the future when we do
export async function createListing(input: {
  title: string;
  pricePerDay: number;
  category?: string;
  size?: string;
  condition?: string;
  image?: File;
}): Promise<Listing> {
  const authHeaders = await getAuthHeaders();
  // Use multipart/form-data so we can send both text fields and an optional image file.
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('pricePerDay', String(input.pricePerDay));

  if (input.category) {
    formData.append('category', input.category);
  }

  if (input.size) {
    formData.append('size', input.size);
  }

  if (input.condition) {
    formData.append('condition', input.condition);
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  // The backend creates the listing, uploads the image (if provided), and returns the created row.
  const response = await fetch(`${apiBaseUrl}/api/listings`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  // parseJsonResponse throws on non-2xx and returns payload.data on success.
  return parseJsonResponse<Listing>(response);
}

// listingsRouter.patch('/:id', ...)
export async function updateListing(
  listingId: number,
  input: {
    title: string;
    pricePerDay: number;
    category?: string;
    size?: string;
    condition?: string;
    image?: File;
  },
): Promise<Listing> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('pricePerDay', String(input.pricePerDay));

  if (input.category) {
    formData.append('category', input.category);
  }

  if (input.size) {
    formData.append('size', input.size);
  }

  if (input.condition) {
    formData.append('condition', input.condition);
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  const response = await fetch(`${apiBaseUrl}/api/listings/${listingId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: formData,
  });

  return parseJsonResponse<Listing>(response);
}

// listingsRouter.delete('/:id', ...)
export async function deleteListing(listingId: number): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${apiBaseUrl}/api/listings/${listingId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders, 'Content-Type': 'application/json',
    },
  });

  await parseJsonResponse<{ deleted: boolean }>(response);
}

export async function getOrCreateConversation(input: {
  listing_id: number;
  other_user_id: number;
}): Promise<Conversation> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${apiBaseUrl}/api/conversations`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseJsonResponse<Conversation>(response);
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`${apiBaseUrl}/api/messages/${conversationId}`);
  return parseJsonResponse<Message[]>(response);
}

export async function sendMessage(input: {
  conversation_id: number;
  sender_id: number;
  body: string;
}): Promise<Message> {
  const response = await fetch(`${apiBaseUrl}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseJsonResponse<Message>(response);
}