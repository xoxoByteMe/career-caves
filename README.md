# CAREER CAVES
The platform for young professionals to find professional business wear.

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

### Supabase CLI From Backend
If the `supabase` command is not installed globally on your machine, run it with `npx` from the `backend` folder:

```bash
cd backend
npx supabase login
```

After logging in, link this backend to your Supabase project:

```bash
cd backend
npx supabase link --project-ref <your-project-ref>
```

Backend `.env` values:
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)

### Database Migrations
Store migration files in `backend/supabase/migrations` and run all Supabase migration commands from the `backend` folder.

Create a new migration file:

```bash
cd backend
npx supabase migration new create_listings_table
```

This creates a timestamped SQL file in `backend/supabase/migrations`. Add your SQL schema changes to that file, then apply them to the linked remote database:

```bash
cd backend
npx supabase db push
```

To pull the current remote schema into a migration file:

```bash
cd backend
npx supabase db pull
```


Notes:
- Use `npx supabase ...` if `supabase ...` is not recognized in PowerShell.
- `db pull` and `db dump` may require Docker Desktop on Windows, depending on your CLI setup.
- The safest workflow is: create a migration, write the SQL deliberately, run `db push`, then commit the migration file.

### Starter API Routes
- `GET /api/health`
- `GET /api/listings`
- `POST /api/listings` (requires `Authorization: Bearer <token>`)

## Deployment

### Frontend - Vercel (recommended) or Netlify
1. Connect your GitHub repo.
2. Set root directory to `frontend/career-caves-app`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables:
	 - `VITE_SUPABASE_URL`
	 - `VITE_SUPABASE_ANON_KEY`

### Frontend - Azure Static Web Apps
1. Create a Static Web App in Azure.
2. Set app location to `frontend/career-caves-app`.
3. Build command: `npm run build`.
4. Output location: `dist`.
5. Add env vars in Configuration -> Application settings.
6. Add `staticwebapp.config.json` in `frontend/career-caves-app/public/` with:
	 `{ "navigationFallback": { "rewrite": "/index.html" } }`

### Backend - Azure App Service / Render / Railway / Fly.io
1. Deploy from the `backend` folder as a Node service.
2. Build command: `npm run build`.
3. Start command: `npm start`.
4. Add environment variables:
	 - `PORT`
	 - `CORS_ORIGIN`
	 - `SUPABASE_URL`
	 - `SUPABASE_SERVICE_ROLE_KEY` (equivalent to secret key in settings-> api keys. It is not the publishable key)

## Package Versions
- Node.js 22.12+ (recommend using NVM to manage Node versions)
