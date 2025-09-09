# Data Sync Funktionalitet

Denne mappe indeholder funktionalitet til at synkronisere spiller- og klubdata fra API-Football til vores database.

## Oversigt

Systemet kan hente spillere og klubber fra dansk superliga og gemme dem i vores database med korrekte relationer.

## API Endpoints

### POST `/api/sync/danish-superliga`

Synkroniserer alle spillere og klubber fra dansk superliga.

**Response:**

```json
{
  "success": true,
  "message": "Successfully synced Danish Superliga data. Created 5 clubs, updated 0 clubs, created 22 players, updated 0 players.",
  "stats": {
    "clubsCreated": 5,
    "clubsUpdated": 0,
    "playersCreated": 22,
    "playersUpdated": 0,
    "errors": []
  }
}
```

### GET `/api/sync/status`

Henter status over synced data i databasen.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalClubs": 5,
    "totalPlayers": 22,
    "clubsByCountry": [
      {
        "_count": { "country": 5 },
        "country": "Denmark"
      }
    ],
    "playersByPosition": [
      { "_count": { "position": 5 }, "position": "GOALKEEPER" },
      { "_count": { "position": 6 }, "position": "DEFENDER" },
      { "_count": { "position": 5 }, "position": "ATTACKER" },
      { "_count": { "position": 6 }, "position": "MIDFIELDER" }
    ]
  }
}
```

### DELETE `/api/sync/cleanup`

Rydder op i gamle data (ikke implementeret endnu).

## Database Struktur

### Club Model

- `id`: Unik identifikator
- `externalId`: API-Football team ID
- `name`: Klubnavn
- `logo`: URL til klublogo
- `country`: Land (Danmark for superliga)

### Player Model

- `id`: Unik identifikator
- `externalId`: API-Football player ID
- `name`: Spillernavn
- `age`: Alder
- `number`: Trøjenummer
- `position`: Position (GOALKEEPER, DEFENDER, MIDFIELDER, ATTACKER)
- `photo`: URL til spillerbillede
- `clubId`: Reference til klub

### DraftPick Model

- `id`: Unik identifikator
- `pickOrder`: Rækkefølge i draften
- `round`: Hvilken runde
- `teamId`: Reference til hold
- `playerId`: Reference til spiller
- `leagueId`: Reference til liga

## Konfiguration

For at bruge den rigtige API-Football service, skal du:

1. Tilmeld dig RapidAPI og API-Football
2. Sæt `RAPIDAPI_KEY` i din `.env` fil
3. Skift import i `handlers.ts` fra mock til rigtig service:

```typescript
// Fra:
import { apiFootballMockService as apiFootballService } from "../services/api-football-mock";

// Til:
import { apiFootballService } from "../services/api-football";
```

## Test Data

Mock servicen indeholder test data for 5 danske superliga hold:

- FC København
- Brøndby IF
- AGF
- FC Midtjylland
- OB

Hver klub har 4-5 spillere fordelt på de forskellige positioner.

## Position Mapping

API-Football positioner mappes til vores enum:

- `Goalkeeper` → `GOALKEEPER`
- `Defender` → `DEFENDER`
- `Midfielder` → `MIDFIELDER`
- `Attacker` → `ATTACKER`
