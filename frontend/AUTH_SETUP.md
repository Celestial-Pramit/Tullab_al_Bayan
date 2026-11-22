# Live Supabase & Google OAuth Setup (`frontend/`)

Live authentication uses **Supabase Auth (Google OAuth PKCE)** backed by `public.user_roles`, `public.batches`, and `public.students` (see [../docs/DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md)). Demo accounts and `sessionStorage` role switching have been removed from `src/app/App.jsx`.

## 1. Local Development Environment

1. Install frontend dependencies from `frontend/`:
   ```powershell
   npm ci --cache D:\npm-cache
   ```
2. Start local Supabase (requires WSL2 + Docker Desktop) and apply migrations + local dev seed:
   ```powershell
   npx supabase start
   npx supabase db reset
   ```
3. Copy `.env.example` to `.env.local` (gitignored) and set the local or Staging values:
   - `VITE_SUPABASE_URL` — e.g. `http://127.0.0.1:54321` locally (or your Staging project URL)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — publishable / anon key only
   - **Never** expose `service_role` keys or Google OAuth Client Secrets in any `VITE_*` variable or commit `.env.local` to Git.

## 2. Google OAuth Configuration (Hosted / Staging / Production)

1. Create a Google OAuth **Web application** client in Google Cloud Console and add the Supabase Auth callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`).
2. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and configure the Client ID and Client Secret.
3. In Supabase **Authentication → URL Configuration**, set the Site URL and add exact `/sign-in` redirect URLs for every environment (for example `http://localhost:5173/sign-in` and your Vercel Preview/Production `/sign-in` URLs).
4. Note for local Docker (`http://127.0.0.1:54321`): interactive Google OAuth requires enabling the Google provider and valid OAuth credentials in local Supabase auth configuration; without them, Google redirect sign-in cannot complete against Google locally.

## 3. Role Assignment & Student Account Linking

- **Pending users:** Any newly signed-in Google user without a row in `public.user_roles` receives `role = 'pending'` and sees the **"Awaiting institute access"** screen with zero access to batches, roster, attendance, tuition, or homework.
- **Staff roles (`admin` / `teacher`):** Provisioned strictly server-side / via trusted SQL migration or Supabase SQL Editor in `public.user_roles` (`student_id = NULL`).
- **Students:** Admins manually link or unlink signed-in Google accounts inside the Admin portal using the `SECURITY DEFINER` RPCs `list_pending_auth_users()`, `link_student_account(p_student_id, p_user_id)`, and `unlink_student_account(p_student_id)`. Unlinking revokes student portal access immediately while preserving `public.students` and all historical attendance/tuition rows.
