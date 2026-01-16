# Supabase Setup Instructies

## Stap 1: Supabase Credentials Toevoegen

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key-hier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Belangrijk:
- **Geen spaties** rondom de `=` tekens
- **Geen quotes** rondom de waarden (tenzij de waarde zelf quotes bevat)
- Elke variabele op een **nieuwe regel**

## Voorbeeld van correct formaat:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Waar vind je deze waarden?

1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar **Settings** → **API**
4. Kopieer:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Geheim houden!)

## Stap 2: Test de Connectie

### Optie 1: Via Test Script
```bash
node scripts/test-supabase.js
```

### Optie 2: Via API Route
1. Start de dev server: `npm run dev`
2. Ga naar: `http://localhost:3000/api/test-supabase`
3. Je zou een JSON response moeten zien met de status

## Stap 3: Database Schema Uitvoeren

1. Ga naar je Supabase project
2. Open **SQL Editor**
3. Kopieer de inhoud van `supabase/schema.sql`
4. Voer het script uit
5. Controleer of de tabellen zijn aangemaakt onder **Table Editor**

## Veelvoorkomende Problemen

### "Missing environment variables"
- Check of de variabelen correct zijn gespeld
- Check of er geen spaties zijn rondom `=`
- Check of het bestand `.env.local` heet (niet `.env` of `.env.local.txt`)

### "Database schema not found"
- Je hebt het schema nog niet uitgevoerd
- Voer `supabase/schema.sql` uit in de SQL Editor

### "Permission denied"
- Check of je de juiste anon key gebruikt
- Check of RLS policies correct zijn ingesteld (zit in schema.sql)

