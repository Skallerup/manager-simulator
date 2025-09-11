# Game Engine Dokumentation

## Oversigt
Game Engine'en simulerer fodboldkampe minut for minut mellem to hold. Den tager højde for individuelle spillerevner, holdstyrke, positioner og andre faktorer for at skabe realistiske kampresultater.

## Hovedkomponenter

### 1. Holdstyrke Beregning (`calculateTeamStrength`)

**Formål:** Beregner den samlede styrke for et hold baseret på startopstillingen.

**Beregning:**
- Hver spiller får en position-specifik styrke score
- Captain bonus: +10% til alle stats
- Straffe for ufuldstændige hold (mindre end 11 spillere)

**Position-specifik vægtning:**
- **Målmand:** Reflexes (40%) + Overall (30%) + Defending (20%) + Speed (10%)
- **Forsvarer:** Defending (40%) + Overall (25%) + Speed (15%) + Passing (10%) + Stamina (10%)
- **Midtbane:** Passing (30%) + Overall (25%) + Stamina (20%) + Speed (15%) + Defending (10%)
- **Angriber:** Shooting (40%) + Speed (25%) + Overall (20%) + Passing (15%)

**Eksempel:**
- Målmand med 90 reflexes, 80 overall, 70 defending, 60 speed = 90*0.4 + 80*0.3 + 70*0.2 + 60*0.1 = 83 styrke

### 2. Possession Beregning

**Formål:** Bestemmer hvilket hold der har bolden i hver minut.

**Beregning:**
```
strengthDifference = homeStrength - awayStrength
homePossession = 0.5 + (strengthDifference / 200)
```

**Resultat:**
- Stærkere hold får mere possession
- Possession er begrænset mellem 10% og 90%
- Store forskelle i styrke giver dramatiske possession forskelle

**Eksempel:**
- Hjemmehold: 80 styrke, Udehold: 20 styrke
- Forskelle: 60
- Hjemme possession: 0.5 + (60/200) = 0.8 = 80%

### 3. Event Chancer per Minut

**Formål:** Bestemmer hvilke begivenheder der sker i hver minut.

**Beregning:**
```
strengthRatio = attackingStrength / defendingStrength
baseEventChance = 0.15 + (strengthRatio - 1) * 0.1
```

**Event typer:**
1. **Mål forsøg** - Beregnet dynamisk baseret på holdstyrke
2. **Skud** - Beregnet dynamisk baseret på offensive evner
3. **Kort** - 2% chance
4. **Udskiftning** - 1% chance

### 4. Målchance Beregning (`calculateGoalChance`)

**Formål:** Beregner sandsynligheden for at et mål forsøg bliver til mål.

**Faktorer:**
- Angriberens offensive evner (shooting, speed, overall)
- Målmandens defensive evner (reflexes, overall)
- Holdstyrke forskel
- Position-specifik bonusser
- Captain bonus

**Beregning:**
```
avgAttackingSkill = (shooting + speed + overall) / 3
goalkeeperSkill = (reflexes + overall) / 2
skillDifference = (avgAttackingSkill - goalkeeperSkill) / 100
strengthDifference = (attackingStrength - defendingStrength) / 100

baseChance = 0.02 + skillDifference * 0.1 + strengthDifference * 0.15
```

**Bonusser:**
- Angriber position: +10%
- Captain: +5%
- Maksimal chance: 25%

### 5. Skudchance Beregning (`calculateShotChance`)

**Formål:** Beregner sandsynligheden for at der sker et skud forsøg.

**Faktorer:**
- Offensive spillere (angribere og midtbanespillere)
- Gennemsnitlig offensive evner
- Holdstyrke forskel

**Beregning:**
```
avgOffensiveSkill = (shooting + speed + passing + overall) / 4
strengthDifference = (attackingStrength - defendingStrength) / 100

baseChance = 0.05 + (avgOffensiveSkill - 50) / 200 + strengthDifference * 0.1
```

**Maksimal chance:** 30%

### 6. Mål Simulation (`simulateGoal`)

**Formål:** Simulerer et specifikt mål forsøg.

**Spiller valg:**
- Vælger den bedste angriber (højeste shooting + overall)
- Tager højde for individuelle evner

**Beregning:**
```
playerSkill = (shooting + speed + overall) / 3
playerGoalChance = playerSkill / 200
strengthDifference = (attackingStrength - defendingStrength) / 50
strengthBonus = Math.max(0, strengthDifference * 0.3)

goalChance = playerGoalChance + strengthBonus + positionBonus + captainBonus
```

**Bonusser:**
- Angriber position: +10%
- Captain: +5%
- Maksimal chance: 80%

### 7. Skud Simulation (`simulateShot`)

**Formål:** Simulerer et skud forsøg.

**Spiller valg:**
- Vælger den bedste offensive spiller (højeste shooting + speed + passing)
- Inkluderer både angribere og midtbanespillere

### 8. Redning Simulation (`simulateSave`)

**Formål:** Simulerer en målmands redning.

**Spiller valg:**
- Vælger den bedste målmand (højeste reflexes + overall)

## Praktiske Eksempler

### Eksempel 1: Stærkt hold vs. Svagt hold
- **Hjemmehold:** 80 styrke (11 spillere, alle 80+ rating)
- **Udehold:** 20 styrke (11 spillere, alle 20+ rating)
- **Forskelle:** 60 point
- **Resultat:** Hjemmehold får ~80% possession, meget høje målchancer

### Eksempel 2: Lige stærke hold
- **Hjemmehold:** 60 styrke
- **Udehold:** 60 styrke
- **Forskelle:** 0 point
- **Resultat:** ~50% possession hver, moderate målchancer

### Eksempel 3: Ufuldstændigt hold
- **Hjemmehold:** 80 styrke (kun 8 spillere)
- **Udehold:** 60 styrke (11 spillere)
- **Straffe:** 8 * 3 = 24 point straf
- **Resultat:** Hjemmehold får ~56 styrke, stadig fordel men mindre

## Vigtige Parametre

### Målchance Parametre
- **Base chance:** 2%
- **Skill multiplier:** 0.1
- **Strength multiplier:** 0.15
- **Position bonus:** 10% (angribere)
- **Captain bonus:** 5%
- **Maksimal chance:** 25%

### Skudchance Parametre
- **Base chance:** 5%
- **Skill multiplier:** 0.005
- **Strength multiplier:** 0.1
- **Maksimal chance:** 30%

### Possession Parametre
- **Base possession:** 50%
- **Strength multiplier:** 0.005 (1/200)
- **Minimum possession:** 10%
- **Maksimal possession:** 90%

## Fejlfinding

### Problem: For lige kampe mellem stærke og svage hold
**Løsning:** Øg strength multiplier i målchance beregning

### Problem: For få mål i kampe
**Løsning:** Øg base chance eller skill multiplier

### Problem: For meget possession til svage hold
**Løsning:** Øg strength multiplier i possession beregning

## Konfiguration

Game engine'en kan konfigureres via `GameEngineConfig`:
- `matchLength`: Kamp længde i minutter (standard: 90)
- `homeAdvantage`: Hjemme fordel (standard: 0.1)
- `weatherImpact`: Vejr påvirkning (standard: 0.05)

## Fremtidige Forbedringer

1. **Formation påvirkning:** Forskellige formationer påvirker holdstyrke
2. **Spiller træthed:** Stamina påvirker præstation i løbet af kampen
3. **Taktik:** Angrebs- og forsvarstaktikker
4. **Veje:** Vejr påvirker forskellige spillertyper forskelligt
5. **Psykologi:** Momentum og kampens gang påvirker præstation
