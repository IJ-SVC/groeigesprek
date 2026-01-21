# Groeigesprekken Aanmeldsysteem

Aanmeldsysteem voor ontwikkelgesprekken in groepsvorm en ontwikkelgesprekken – spelwerkvorm (individueel) bij IJsselheem.

## Technologie Stack

- Next.js 14+ (App Router) met TypeScript
- Tailwind CSS met IJsselheem huisstijl
- Supabase (PostgreSQL + Auth)
- Nodemailer (optioneel voor e-mails)

## Setup

1. Installeer dependencies:
```bash
npm install
```

2. Maak `.env.local` bestand met:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

## Database Setup

Zie `supabase/schema.sql` voor database schema en migraties.


