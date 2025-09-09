# Beskrivelse

Vi er igang med at lave en fodbold manager spil.

Det vi ønsker er at man som bruger kan oprette et liga og inviterer venner med til at joine liga'en. Hver bruger kan oprette et hold som kan kobles til liga'en, som i første omgang bare består af et navn.

## Tilmelding af grupper

Der er to måder at være medlem af en gruppe på

- enten kan man oprette gruppen og dermed være administrator af gruppen
- eller man kan joine gruppen som medlem

## Regler for grupper

Regler for grupperne:

- Administrator skal kunne bestemme hvor mange hold der er i en gruppe.
- Administrator skal sætte en deadline for tilmelding og når deadlline nås, går draft af spillere igang
- Administrator skal kunne vælge mellem hvilken draft metoder der skal bruges (du bestemmer hvilke der giver mening)

## Draft

Draften foregår på følgende måde:

- Hvert hold får tildelt en draft position tilfældigt.
- Herefter går der fra runde til runde
- Draft'en foregår realtime og alle spillere skal sidde klar til deres pick
- Når ens draft tid starter, så har man 60 sekunder til at vælge sin spiller
- Man kan også have valgt sin spiller på forhånd og hvis spilleren er ledig, så vælges denne spiller automatisk
- Holdet er fuldendt når alle spillere har valgt 16 spillere på sit hold
- Man skal have valgt mindst 1 målmand, 5 forsvarsspillere, 5 midtbanespillere + 3 angribere

## Sync af data

I første omgang ønsker vi at spille med spillere fra den danske superliga

- Alt data skal hentes fra https://rapidapi.com/ 's api
- Spillerne skal hentes og gemmes og ajourføres, så hvis de skifter klub, skal dette fremgå
- Spillernes klubber skal hentes ind og knyttes til spillerne
