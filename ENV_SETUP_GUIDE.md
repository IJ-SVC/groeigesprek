# Environment Variabelen Setup Guide

## Probleem
Je `.env` en `.env.local` bestanden bestaan, maar de Supabase variabelen worden niet gevonden.

## Oplossing

### Stap 1: Open `.env.local` in een teksteditor
Gebruik bijvoorbeeld Notepad, VS Code, of een andere teksteditor.

### Stap 2: Voeg deze regels toe (zonder quotes, zonder spaties rondom =)

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key-hier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Stap 3: Vervang de waarden

1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar **Settings** → **API**
4. Kopieer de waarden:

   - **Project URL** → vervang `https://jouw-project.supabase.co`
   - **anon public** key → vervang `jouw-anon-key-hier`
   - **service_role** key → vervang `jouw-service-role-key-hier`

### Stap 4: Belangrijke regels

✅ **DO:**
- Elke variabele op een eigen regel
- Geen spaties rondom het `=` teken
- Geen quotes rondom de waarden
- Sla het bestand op als `.env.local` (niet `.env.local.txt`)

❌ **NIET:**
- `NEXT_PUBLIC_SUPABASE_URL = https://...` (spaties rondom =)
- `NEXT_PUBLIC_SUPABASE_URL="https://..."` (quotes)
- Alles op één regel

### Stap 5: Test

Na het opslaan, test met:
```bash
node scripts/test-supabase-nextjs.js
```

Of start de dev server:
```bash
npm run dev
```

En ga naar: `http://localhost:3000/api/test-supabase`

## Voorbeeld van correct formaat

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### "Missing environment variables"
- Check of het bestand `.env.local` heet (niet `.env` of `.env.local.txt`)
- Check of er geen spaties zijn rondom `=`
- Check of de variabelen exact zo gespeld zijn (hoofdletters, underscores)
- Herstart je terminal/IDE na het toevoegen

### "Invalid API key"
- Check of je de juiste key hebt gekopieerd (anon public, niet service_role voor NEXT_PUBLIC)
- Check of je de hele key hebt gekopieerd (ze zijn ~200+ karakters lang)

### "Database schema not found"
- Je keys werken! ✅
- Maar je moet eerst het database schema uitvoeren
- Ga naar Supabase SQL Editor en voer `supabase/schema.sql` uit

