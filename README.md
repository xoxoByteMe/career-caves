# CAREER CAVES
The platform for young professionals to find professional business wear.
https://career-caves.vercel.app/

## Project Structure

```
career-caves/
	backend/
		src/
			index.ts              # Express app entrypoint
			lib/
				env.ts              # Env parsing/validation
				supabaseAdmin.ts    # Supabase admin client (service role key)
			middleware/
				requireAuth.ts      # Verifies Supabase JWT from frontend
			routes/
				health.ts           # API health route
				listings.ts         # Starter listings routes
		.env                    # Local env vars - DO NOT COMMIT
		.env.example            # Template to share with team
	frontend/
		career-caves-app/       # Vite + React + TypeScript SPA
			src/
				app/
					routes.tsx        # All route definitions
				lib/
					supabaseClient.ts # Frontend Supabase client (anon key)
				pages/              # One file per route/page
				App.tsx             # Shared layout shell (nav, modal)
				main.tsx            # App entry point + BrowserRouter
			.env                  # Local env vars - DO NOT COMMIT
			.env.example          # Template to share with team
```

## Architecture

- Frontend uses Supabase Auth for login/session.
- Frontend sends access tokens to backend routes for protected operations.
- Backend verifies tokens with Supabase and performs server-side CRUD logic.
- Supabase stores data and enforces Row Level Security (RLS).
- Listing images are uploaded to a **Supabase Storage bucket** (`caves-images`) via the backend using the Storage REST API, then served as public URLs.

### Image Upload Flow

1. Frontend sends a multipart form (`FormData`) with the image file to `POST /api/listings`.
2. Backend (Express + multer) receives the file in memory.
3. Backend uploads the raw bytes directly to Supabase Storage via the REST API (`/storage/v1/object/...`) with the service role key.
4. Images are stored at `listings/{listing_id}/{uuid}.{ext}` inside the `caves-images` bucket.
5. The public URL is saved to the `listingimages` table and returned in listing responses.

### Supabase Storage Setup

1. Go to **Supabase Dashboard → Storage** and create a bucket named `caves-images`.
2. Set the bucket to **Public** so images can be accessed via public URLs.
3. Ensure `SUPABASE_LISTING_IMAGES_BUCKET=caves-images` is set in backend `.env`.

## Local Development

### Frontend
```bash
cd frontend/career-caves-app
npm install
npm run dev
```

Frontend `.env` values:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend `.env` values:
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
- `SUPABASE_LISTING_IMAGES_BUCKET=caves-images`


### Supabase CLI From Backend (this is optional only for dev if want to interact with supabase directly)
If the `supabase` command is not installed globally on your machine, run it with `npx` from the `backend` folder:

```bash
cd backend
npx supabase login
```

After logging in, link this backend to your Supabase project:

```bash
cd backend
npx supabase link --project-ref <supabaseProjectID>
```

### Database Migrations
Store migration files in `backend/supabase/migrations` and run all Supabase migration commands from the `backend` folder.


### Starter API Routes
- `GET /api/health`
- `GET /api/listings`
- `POST /api/listings` (requires `Authorization: Bearer <token>`)

## Package Versions
- Node.js 22.12+ (recommend using NVM to manage Node versions)
