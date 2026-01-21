# Admin Guide - Groeigesprekken Systeem

## Inloggen als Admin

### Stap 1: Maak een Admin Gebruiker aan in Supabase

1. Ga naar [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar **Authentication** → **Users**
4. Klik op **Add user** → **Create new user**
5. Vul in:
   - **Email**: je admin email adres
   - **Password**: een sterk wachtwoord
   - **Auto Confirm User**: ✅ (zet dit aan)
6. Klik op **Create user**

### Stap 2: Geef de gebruiker admin rechten

1. In de **Users** lijst, klik op de gebruiker die je net hebt aangemaakt
2. Scroll naar **User Metadata**
3. Klik op **Edit** (of voeg toe als het leeg is)
4. Voeg deze metadata toe:
   ```json
   {
     "role": "admin"
   }
   ```
   OF
   ```json
   {
     "is_admin": true
   }
   ```
5. Klik op **Save**

### Stap 3: Log in via de applicatie

1. Start de development server:
   ```bash
   npm run dev
   ```

2. Ga naar: `http://localhost:3000/admin/login`

3. Log in met:
   - **Email**: het email adres dat je hebt gebruikt bij het aanmaken
   - **Password**: het wachtwoord dat je hebt ingesteld

4. Na succesvol inloggen word je doorgestuurd naar het admin dashboard

## Sessies Aanmaken

### Via de Admin Interface

1. **Log in** als admin (zie hierboven)

2. Ga naar **Sessies** in het menu (of naar `/admin/sessies`)

3. Klik op **Nieuwe sessie** knop

4. Vul het formulier in:
   - **Gesprekstype**: Kies tussen Ontwikkelgesprek in groepsvorm of Ontwikkelgesprek – spelwerkvorm (individueel)
   - **Datum**: Selecteer de datum
   - **Starttijd**: Kies de starttijd
   - **Eindtijd**: (Optioneel) Kies de eindtijd
   - **Locatie**: Vul de locatie in
   - **Online**: Vink aan als het een online sessie is
   - **Teams-link**: (Als online) Vul de Teams link in
   - **Begeleider**: Naam van de begeleider
   - **Max deelnemers**: Aantal deelnemers (standaard 10)
   - **Status**: 
     - **Concept**: Niet zichtbaar voor medewerkers
     - **Gepubliceerd**: Zichtbaar en inschrijfbaar
     - **Geannuleerd**: Geannuleerde sessie
   - **Doelgroep**: (Optioneel) Voor wie is deze sessie
   - **Opmerkingen**: (Optioneel) Interne opmerkingen
   - **Instructies**: (Optioneel) Instructies voor deelnemers

5. Klik op **Aanmaken**

6. De sessie wordt aangemaakt en verschijnt in de lijst

### Sessie Bewerken

1. Ga naar **Sessies** in het admin menu
2. Klik op **Bewerken** bij de sessie die je wilt wijzigen
3. Pas de gegevens aan
4. Klik op **Bijwerken**

### Sessie Annuleren

1. Ga naar **Sessies** in het admin menu
2. Klik op **Bewerken** bij de sessie
3. Verander de **Status** naar **Geannuleerd**
4. Vul eventueel een reden in bij **Opmerkingen**
5. Klik op **Bijwerken**

## Admin Functionaliteiten

### Dashboard (`/admin`)
- Overzicht van totaal aantal sessies
- Overzicht van totaal aantal aanmeldingen
- Aanmeldingen per gesprekstype
- Sessies met hoge bezetting (>80%)

### Sessiebeheer (`/admin/sessies`)
- Overzicht van alle sessies
- Filter op type en status
- Nieuwe sessie aanmaken
- Sessie bewerken
- Sessie verwijderen
- Deelnemers bekijken per sessie

### Deelnemersbeheer (`/admin/sessies/[id]/deelnemers`)
- Overzicht van alle ingeschreven deelnemers
- Capaciteitsoverzicht
- Deelnemer verwijderen
- Export naar Excel

### Aanmeldingen Overzicht (`/admin/aanmeldingen`)
- Overzicht van alle aanmeldingen
- Filter op type, sessie, status
- Export naar Excel of CSV
- Aanmelding verwijderen

### Instellingen (`/admin/instellingen`)
- Header content beheren (titel en subtitle voor startpagina)
- Cut-off tijd voor annulering instellen
- E-mail instellingen (aan/uit)

## Belangrijke Notities

### Admin Rechten
- Alleen gebruikers met `role: "admin"` of `is_admin: true` in hun user metadata kunnen inloggen
- Admin routes zijn beschermd via middleware
- Zonder admin rechten word je doorgestuurd naar de login pagina

### Sessie Status
- **Concept**: Sessie is aangemaakt maar nog niet zichtbaar voor medewerkers
- **Gepubliceerd**: Sessie is zichtbaar en medewerkers kunnen zich aanmelden
- **Geannuleerd**: Sessie is geannuleerd, medewerkers kunnen zich niet meer aanmelden

### Capaciteit
- Het systeem controleert automatisch of een sessie vol is
- Medewerkers kunnen zich niet aanmelden als de sessie vol is
- Race conditions worden voorkomen via database constraints

## Troubleshooting

### "Je hebt geen toegang tot het admin panel"
- Check of de gebruiker `role: "admin"` of `is_admin: true` heeft in Supabase
- Log uit en log opnieuw in
- Check of je de juiste email gebruikt

### Kan niet inloggen
- Check of de gebruiker bestaat in Supabase Authentication
- Check of "Auto Confirm User" is aangezet
- Check of het wachtwoord correct is

### Sessies zijn niet zichtbaar voor medewerkers
- Check of de status op "Gepubliceerd" staat
- Check of de datum in de toekomst ligt
- Check of het gesprekstype correct is ingesteld

