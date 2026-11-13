# Sample Pack — Æther Keys

Banques d'échantillons pour l'application **Æther Keys**, séparées de l'APK.

| Pack | Instrument | Taille |
|---|---|---|
| Grand Piano | Piano à queue | 31 Mo |
| Upright Piano | Piano droit | 32 Mo |
| Soprano / Alto / Tenor / Baritone Sax | Sax | 3–7 Mo chacun |

Les **pianos électriques (EP)** restent embarqués dans l'APK.

## Comment l'app récupère les packs

L'app lit `manifest.json` puis télécharge chaque banque depuis les assets de la
[release v1](../../releases/tag/v1). Chaque entrée porte `size` et `sha256` : le
téléchargement est vérifié avant d'être installé.

## Licence

Les codes, samples et éléments ont été créés et travaillés par l'équipe et
plusieurs indépendants soutenant le projet.
