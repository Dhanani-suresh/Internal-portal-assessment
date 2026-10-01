# Internal Portal

A small, full-stack internal portal built with Next.js for the Full Stack Engineer take-home assessment. It gives a team a single, authenticated place to read, publish, and manage announcements.

The brief prioritises one complete feature over several incomplete ones. I therefore chose an announcements feed and implemented the full journey: sign in, access a protected portal, load data through an API, publish an update, and delete an update when authorised.

## Highlights

- Built with the Next.js App Router, including server-rendered pages and route handlers.
- Custom login and logout flow using signed, expiring HTTP-only session cookies.
- Dashboard and announcements API protected on the server.
- Create, view, and delete announcements.
- Delete permission is restricted to the announcement author.
- Persistent local data stored in a JSON file for zero-configuration setup.
- Responsive, accessible interface with loading, success, error, confirmation, and input-validation states.

## Technology choices

| Area | Choice | Reasoning |
| --- | --- | --- |
| Framework | Next.js App Router | Keeps the React frontend, server-rendered routes, and API endpoints in one cohesive application. |
| Language | TypeScript | Makes component props, API data, and storage contracts more explicit and safer to change. |
| Authentication | Signed session cookie | Provides a small, dependency-free session flow appropriate for the scope of a single-account take-home project. |
| Storage | JSON file | Lets reviewers run the project immediately without provisioning a database, while keeping storage behind a dedicated server module. |
| Styling | CSS | Keeps the UI lightweight and the design system easy to inspect. |

## Running locally

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Copy the environment template.

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Open `.env.local` and replace `SESSION_SECRET` with a long, random value. This value is required; the app intentionally has no default signing secret.

4. Start the development server.

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

### Demo account

The project intentionally uses one configurable demo account to keep setup concise.

| Environment variable | Default value |
| --- | --- |
| `PORTAL_DEMO_EMAIL` | `team@acme.test` |
| `PORTAL_DEMO_PASSWORD` | `welcome123` |

You may keep these defaults or change them in `.env.local`. The login screen does not display these credentials.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run typecheck` | Runs TypeScript validation without emitting files. |
| `npm run build` | Creates the production build. |
| `npm run start` | Runs the completed production build. |

## Application structure

```text
src/
  app/
    api/
      auth/                    # Login and logout endpoints
      announcements/           # Read, create, and delete endpoints
    dashboard/                 # Authenticated portal page
    login/                     # Sign-in page
  components/                  # Reusable interactive UI components
  lib/
    auth.ts                    # Session and credential helpers
    announcements.ts           # JSON storage access layer
data/
  announcements.json           # Persisted local announcement data
proxy.ts                       # Early dashboard redirect for signed-out visitors
```

## Authentication and authorisation

The application uses a signed session token stored in an HTTP-only cookie.

1. The login endpoint validates the submitted email and password against the configured environment variables.
2. A successful login creates a signed HMAC token containing the user email and an eight-hour expiry.
3. The token is stored in an HTTP-only, `SameSite=Lax` cookie. In production, the cookie is also marked `Secure`.
4. `proxy.ts` redirects visitors without the session cookie from `/dashboard` to `/login`.
5. The dashboard and every announcements API route independently validate the session signature and expiry before returning protected content.
6. The delete endpoint additionally checks that the signed-in user is the announcement author. It returns `403 Forbidden` for a different author.

This layered approach means route protection is not reliant on client-side UI state or the proxy alone.

## API routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public | Validates credentials and creates a session cookie. |
| `POST` | `/api/auth/logout` | Public | Clears the current session cookie. |
| `GET` | `/api/announcements` | Authenticated | Returns announcements newest first. |
| `POST` | `/api/announcements` | Authenticated | Validates and saves a new announcement. |
| `DELETE` | `/api/announcements/:id` | Authenticated owner | Deletes an announcement when the requester is its author. |

## Data and state management

Announcement data is stored in `data/announcements.json`. The UI never reads or writes that file directly: client components call the Next.js API routes with `fetch`, and the API routes use `src/lib/announcements.ts` as the storage boundary. This keeps the frontend contract independent from the storage mechanism, so a database implementation could replace the JSON repository later without rewriting the UI.

On the client, the announcements component manages the feed, form values, posting state, delete state, and feedback messages locally. This is sufficient for the single-screen scope without adding a global state library.

## Validation checklist

Before submission, run:

```bash
npm run typecheck
npm run build
```

Then verify the main user journey:

1. Open `/dashboard` while signed out and confirm the redirect to `/login`.
2. Sign in with the configured demo account.
3. Publish an announcement and confirm it appears at the top of the feed.
4. Refresh the page and confirm it remains available.
5. Delete your own announcement and confirm it is removed after confirmation.
6. Sign out and confirm the dashboard and announcements API are no longer accessible.

## Scope and future improvements

The JSON store and environment-configured demo account are deliberate choices for a short take-home task: they keep the project easy to run while still demonstrating a complete frontend-to-API-to-storage flow.

For a production portal, I would next add a database, password hashing or an identity provider, role-based permissions, audit logs, rate limiting, automated tests, and monitoring. Those additions are intentionally outside this focused implementation.
