# Sheets — prototype complet (JSX)

Prototype React du module **Sheets** (bibliothèque de feuilles de conduite, accords,
setlists) pour l'application Æther Keys. Extrait d'un partage ChatGPT.

## Fichiers

| Fichier | Rôle |
|---|---|
| [`SheetsHome.jsx`](SheetsHome.jsx) | Le composant complet — **1 810 lignes**, 43 245 octets |
| [`index.html`](index.html) | Version rendue, ouvrable directement dans un navigateur |

## URL brute (lisible par un outil ou une IA)

```
https://raw.githubusercontent.com/amiel767/Sample-Pack/main/sheets-prototype/SheetsHome.jsx
```

Cette URL renvoie le texte brut du JSX, sans HTML autour : n'importe quel outil peut
la récupérer par une simple requête HTTP.

## Composant

`export default function SheetsHome({ ... })` — bibliothèque de sheets avec :

- sets en arborescence (sous-dossiers), réordonnables par glisser-déposer ;
- favoris, corbeille, recherche, tris multiples ;
- transposition et notation des accords : lettres (`Am`, `F#m`) ou Nashville (`1m`, `4`) ;
- prévisualisation des accords par fiche ;
- état local avec données d'exemple (`INITIAL_SETS`, `INITIAL_SHEETS`).

## Utilisation

Le fichier est du **JSX** (React). Pour l'afficher :

1. charger React 18, ReactDOM et Babel standalone ;
2. placer le code dans un `<script type="text/babel">` ;
3. retirer la ligne `import React …` et le mot-clé `export default` — dans un script
   babel *inline* ce ne sont pas des modules, et les deux provoquent une erreur ;
4. reprendre les hooks du React global :
   `const { useState, useMemo, useRef, ... } = React;`

`index.html` de ce dossier fait exactement cela.

## Licence

Prototype de design, fourni tel quel, sans garantie.
