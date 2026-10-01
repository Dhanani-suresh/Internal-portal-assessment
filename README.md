# Internal Portal

A full-stack internal portal built with Next.js for the Full Stack Engineer take-home assessment which gives a team a single, authenticated place to read, publish, and manage announcements.

Since brief prioritises one complete feature over several incomplete ones, I chose an announcements feed and implemented the full journey: sign in, access a protected portal, load data through an API, publish an update, and delete an update when authorised.

## Features

- Built with the Next.js App Router, including server-rendered pages and route handlers.
- Custom login and logout flow using signed, expiring HTTP-only session cookies.
- Dashboard and announcements API protected on the server.
- View announcements, with newest posts shown first
- Create announcements with client and server-side validation
- Delete announcements, restricted to the person who created them.
- Local JSON persistence, so announcements remain after a refresh or server restart
- Responsive, accessible interface with loading, success, error, confirmation, and input-validation states.

## Technology choices

| Area | Choice | Reasoning |
| --- | --- | --- |
| Framework | Next.js App Router | Keeps the frontend, server-rendered routes, and API endpoints in one cohesive application. |
| Language | TypeScript | Makes component props, API data, and storage contracts more explicit and safer to change. |
| Authentication | Signed session cookie using an HTTP-only cookie| Provides a small, dependency-free session flow appropriate for the scope of a single-account take-home project. |
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

### Demo account credentials

The demo account is configured through environment variables and has the following defaults: 

- **Email:** `team@acme.test`
- **Password:** `welcome123`

These can be changed through `PORTAL_DEMO_EMAIL` and `PORTAL_DEMO_PASSWORD` in `.env.local`.

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

On the client, the announcements component manages the feed, form values, posting state, delete state, and feedback messages locally. This is enough for the single-screen scope without adding a global state library.

## Component and state choices

I used  small, focused components for login, logout, and the announcements panel. The announcements panel owns the state it needs for the feed, form fields, loading, publishing, deletion, and user feedback. For this single-screen feature, local React state was simpler and clearer than adding a global state library.


## Key decisions and future improvements

- **Content section:** I chose announcements instead of a team list or links page because it gives a simple workflow for viewing, creating, and managing items in one focused feature.
- **Data storage:** I used a JSON file to keep the project easy to run without requiring separate database setup, while still demonstrating a clear UI → API → storage flow. For a production application, I would use a database such as PostgreSQL with an ORM to handle concurrent updates, querying, and data relationships.
- **Authentication:** I used a signed HTTP-only session cookie to keep the session token out of client-side JavaScript while allowing the server to validate protected requests. For production, I would consider an established solution such as Better Auth with a proper user store and securely hashed credentials
- **Server-side API protection:** The dashboard and announcement API routes validate the session on the server, rather than relying on client-side state. The delete endpoint also checks ownership, so users can only manage their own announcements. For a larger application, this could be extended with role-based permissions and audit logging.
- **Local component state:** Since the application only has a small amount of interactive state, I kept it within the relevant React components instead of adding a global state library. A larger application with more shared state could benefit from a dedicated state or data-fetching solution.
