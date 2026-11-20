# Future live sign-in setup

Phase 1 currently runs in demo-only mode. The app does not load the Supabase client or expose Google sign-in. These instructions are for use after live authentication is reconnected to the app in a future phase.

1. Create or select the institute's Supabase project. Apply [the Phase 1 migration](supabase/migrations/202611200001_phase1_access.sql) in that project.
2. Create a Google OAuth **Web application** client. In Google Cloud, add the callback URL shown for the Google provider in Supabase. On hosted Supabase this is typically `https://<project-ref>.supabase.co/auth/v1/callback`. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and set its client ID and client secret.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed portal origin. Add the exact app callback URL for each environment, for example `http://localhost:5173/sign-in` and `https://portal.example.com/sign-in`. Use the actual local port and hostname. A public deployment must serve the React entry page for direct requests to client routes.
4. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` to the project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key. Restart Vite or rebuild the deployment. Keep Google's client secret in Supabase and keep service-role or secret keys out of all `VITE_*` variables.
5. Ask the user to sign in with their institute-approved Google account. In Supabase **Authentication → Users**, verify the Google identity against institute records and copy that user's UUID. An approved institute operator can then link the UUID to the student's existing roster row or create a trusted staff assignment. Until linked, the user can see only their own basic profile. Have them reload after approval.

For example, from the Supabase SQL editor as a trusted operator, replace the example values with approved institute records:

```sql
-- Link an already imported student row after verifying the Google identity.
update public.bayan_student_profiles
set user_id = '<verified-google-user-uuid>'
where student_id = '<approved-student-id>';

-- Grant an approved staff member access. Use either 'teacher' or 'admin'.
insert into public.bayan_staff_access (user_id, role)
values ('<verified-staff-user-uuid>', 'teacher');
```

The institute imports live student profile rows into `bayan_student_profiles` with `student_id`, `full_name`, and `batch`. Removing a staff assignment or clearing a student's linked UUID revokes their database access on subsequent requests. Browser clients have read-only grants and cannot approve or relink themselves.

Use the Student, Teacher, and Admin sample sign-in buttons during the demo phase. Setting Supabase environment variables does not change the active sign-in mode.
