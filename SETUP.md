# FitTrack Setup

## 1. Create a Supabase project
1. Go to https://supabase.com, sign up/log in, and create a new project.
2. Once it's ready, go to **Settings > API** and copy:
   - **Project URL**
   - **anon / public key**

## 2. Set up the database
1. In the Supabase dashboard, open **SQL Editor > New query**.
2. Paste the entire contents of `supabase/schema.sql` from this repo and run it.
   This creates the `workouts`, `workout_exercises`, `workout_sets`, and
   `food_entries` tables, with Row Level Security so each user can only ever
   see their own data.

## 3. Connect the app to Supabase
1. Copy `.env.example` to a new file called `.env.local`.
2. Fill in your Project URL and anon key from step 1.
3. Restart the dev server (`npx expo start`) if it's already running — env
   vars are only read at startup.

## 4. Run the app
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone (iOS or Android) to
open FitTrack live. Sign up for an account from the app's sign-up screen to
start logging workouts and meals.
