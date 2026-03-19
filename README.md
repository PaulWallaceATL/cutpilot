# CutPilot

AI-powered fitness and nutrition execution app. Get personalized workout plans, meal plans, daily checklists, contextual AI coaching, grocery lists, and menu scanning — all in one premium app.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **AI**: OpenAI Responses API with structured outputs (Zod)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

---

## Deployment Guide

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and keys from **Settings > API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL editor and click **Run**
4. This creates all 22 tables, RLS policies, indexes, triggers, and a storage bucket

### Step 3: Configure Environment Variables

In your Vercel project settings (or `.env.local` for local dev), set these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL_TEXT=gpt-4o
OPENAI_MODEL_VISION=gpt-4o
APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the environment variables from Step 3
4. Deploy

The app will be live at your Vercel URL.

---

## Supabase Auth Configuration

In your Supabase project dashboard:

1. Go to **Authentication > URL Configuration**
2. Set the **Site URL** to your Vercel deployment URL
3. Add `https://your-app.vercel.app/**` to **Redirect URLs**

---

## Features

- **AI Plan Generation**: Personalized workout + meal plans based on your goals, body stats, equipment, and dietary preferences
- **Workout Tracking**: Log sets, reps, and weights for every exercise
- **Meal Tracking**: Log meals with one tap, view full ingredient lists and macros
- **Daily Checklist**: Auto-generated daily tasks (workouts, meals, water, sleep)
- **Contextual AI Chat**: Ask questions about your current workout or meal
- **Meal Substitutions**: AI-powered meal swaps with matching macros
- **Menu Scanner**: Upload restaurant menu photos for health-scored recommendations
- **Grocery Lists**: Auto-generated shopping lists from your meal plan
- **Progress Tracking**: Weight logs and progress photos
- **Plan Regeneration**: Regenerate workout or meal plans with optional feedback

---

## Project Structure

```
/app                    # Next.js App Router pages
  /(auth)               # Login, Signup
  /(protected)          # Auth-guarded routes
    /onboarding         # Multi-step onboarding wizard
    /app                # Main app shell
      /today            # Daily dashboard
      /workouts         # Workout plan + tracking
      /meals            # Meal plan + tracking
      /progress         # Weight + photo tracking
      /plan             # Plan regeneration
      /menu-scan        # Menu photo analysis
      /grocery          # Grocery lists
      /profile          # User profile
      /settings         # App settings
/components             # React components
  /ui                   # shadcn/ui components
  /layout               # App shell, nav, header
  /shared               # Reusable components
  /onboarding           # Onboarding step components
  /workout              # Workout-specific components
  /meal                 # Meal-specific components
/lib                    # Utilities and integrations
  /supabase             # Supabase client helpers
  /openai               # OpenAI API functions
  /schemas              # Zod validation schemas
/actions                # Server actions
/hooks                  # Client-side React hooks
/types                  # TypeScript type definitions
/supabase               # SQL schema file
```
