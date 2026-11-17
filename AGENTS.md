# AGENTS.md — règles de travail pour Æther Keys / Sheets

Ce document est le contrat de fonctionnement du projet. Tout agent IA qui intervient sur ce dépôt doit le lire avant de travailler et respecter ces règles. Il prime sur les habitudes ou initiatives autonomes de l'agent.

## 1. Répartition des responsabilités

### ChatGPT — analyse, direction UI et corrections de source
- Analyse le rendu, les captures, les écarts visuels et le code existant.
- Définit les corrections à effectuer, dans un périmètre précis.
- Peut modifier les sources JSX et les autres fichiers explicitement concernés.
- Effectue les commits de corrections qu'il réalise et vérifie leur présence sur GitHub.
- Ne lance pas de compilation, de build APK/AAB ou de chaîne de tests Android.

### DeepSeek — intégration Android, compilation et validation technique
- Prend en charge la compilation, les builds, les tests techniques et la génération APK/AAB.
- Vérifie que les changements transmis s'intègrent correctement au projet Android.
- Travaille sur le portage Android/Compose lorsque les sources Android sont disponibles et que la tâche le demande.
- Signale les erreurs avec leurs causes et les fichiers concernés. Il peut corriger un problème technique dans le périmètre demandé, mais ne profite pas d'une correction de build pour refaire le design.
- Fournit les résultats vérifiables : logs utiles, statut du build, version produite, emplacement de l'APK/AAB et captures du rendu.

### Utilisateur — validation du résultat
- Arbitre les choix de design et valide le résultat visuel.
- Fournit les retours, captures ou consignes complémentaires.
- Aucun changement visuel important ne doit être considéré comme validé sans son retour.

**Règle anti-conflit :** ne modifie pas un fichier JSX ou une correction UI déjà prise en charge par ChatGPT, sauf demande explicite. Ne travaille pas en parallèle sur le même fichier. Si une modification concurrente est détectée, arrête-toi, indique le conflit et demande une synchronisation.

## 2. Objectif du travail actuel

Le chantier concerne la refonte du module **Sheets** d'Æther Keys. Le but n'est pas de réinventer l'interface : il faut rapprocher le rendu final des références et des consignes déjà validées, en corrigeant progressivement les écarts.

Le projet est traité par petites corrections ciblées :
1. observer le rendu réel ;
2. identifier précisément ce qui ne respecte pas la référence ;
3. corriger uniquement les éléments concernés ;
4. compiler et vérifier ;
5. fournir les captures et les résultats ;
6. attendre la validation avant d'élargir le périmètre.

Ne remplace pas un composant entier ou un fichier complet lorsqu'une correction locale suffit. Ne déplace pas des menus, ne change pas les comportements et ne réorganise pas les écrans sans consigne explicite.

## 3. Identité visuelle non négociable

La palette actuelle est l'identité visuelle d'Æther Keys. Elle doit être conservée exclusivement :

```js
const COLORS = {
  bg: "#101722",
  bgTop: "#151E2B",
  panel: "#192332",
  panelRaised: "#202C3E",
  well: "#0B111A",
  line: "rgba(225,235,250,.09)",
  text: "#F0F3F8",
  muted: "#8793A7",
  faint: "#657187",
  accent: "#91B5E9",
};
```

- Ne propose pas une nouvelle palette et ne remplace pas ces couleurs.
- Sunday Keys est uniquement une référence d'élégance, de hiérarchie, de structure et d'ergonomie. Ne copie ni sa palette ni son interface.
- Évite les interfaces composées de cartes/Bento partout. Privilégie une composition ouverte, des lignes lisibles, des espacements maîtrisés et un relief discret.
- Les cases et lignes peuvent gagner en profondeur, mais sans devenir des cartes lourdes avec des ombres excessives.
- Le design JSX et Android doit rester cohérent. Une différence de plateforme doit être justifiée par les contraintes natives, pas par une réinterprétation arbitraire.

## 4. Sources et périmètre connus

Dépôt : `amiel767/Sample-Pack`, branche de travail : `main`.

Fichiers de référence connus :
- `sheets-prototype/SheetsHome.jsx` : source du prototype React/JSX.
- `sheets-prototype/index.html` : rendu navigateur du prototype.
- `sheets-refonte/index.html` : page de présentation/rendu de la refonte.
- `sheets-refonte/sheets_refonte_*.png` et `sheets-refonte/sheets-refonte.gif` : captures de référence disponibles dans le dépôt.

**Attention :** lors de la rédaction de ce document, l'arborescence du dépôt ne contenait pas de sources Android Kotlin/Compose (`.kt`, `.kts`, etc.). Ne prétends donc pas les avoir trouvées et n'invente aucun chemin. Si le portage Android doit être modifié, identifie d'abord le dépôt ou les fichiers Android réellement disponibles et signale clairement s'ils sont absents.

Avant chaque intervention :
- récupère l'état le plus récent de la branche et les derniers commits ;
- identifie les fichiers réellement concernés ;
- vérifie qu'aucune modification concurrente ne risque d'être écrasée ;
- respecte les sources et captures existantes comme références.

## 5. Ce que DeepSeek doit faire à chaque livraison

Quand une correction de source lui est transmise :

1. **Lire la consigne et le diff.** Comprendre exactement ce qui a changé et pourquoi. Ne pas réinterpréter la demande.
2. **Vérifier l'intégration.** Contrôler les dépendances, imports, ressources, signatures et compatibilités nécessaires au build.
3. **Compiler et tester.** Lancer les vérifications adaptées au projet Android. Ne pas se limiter à dire que le code « semble correct ».
4. **Corriger les erreurs techniques dans le périmètre.** Ne pas supprimer une fonctionnalité, neutraliser un contrôle ou modifier le design pour faire passer artificiellement la compilation.
5. **Vérifier le rendu réel.** Ouvrir l'écran concerné sur un appareil ou un émulateur lorsque possible. Comparer avec les références et les consignes.
6. **Produire des preuves.** Fournir les logs pertinents, le résultat exact des tests/builds et des captures nettes des écrans concernés.
7. **Faire un compte rendu structuré** avec :
   - fichiers modifiés ;
   - corrections techniques réalisées ;
   - commandes et tests exécutés ;
   - résultat de chaque test/build ;
   - erreurs restantes, sans les masquer ;
   - chemin ou lien exact de l'APK/AAB, si généré ;
   - captures du rendu après compilation.

Si le build échoue, indique le premier échec réel, le message d'erreur et sa cause probable. Ne déclare jamais un build réussi sans résultat de compilation vérifiable.

## 6. Ce que DeepSeek ne doit pas faire

- Ne pas lancer une refonte visuelle autonome.
- Ne pas changer la palette, la typographie, les proportions ou la disposition sans demande.
- Ne pas remplacer les corrections ciblées par une réécriture générale.
- Ne pas copier Sunday Keys.
- Ne pas inventer des fichiers, des tests, des captures ou des résultats.
- Ne pas écraser les commits ou les changements récents d'un autre intervenant.
- Ne pas modifier les fichiers JSX/UI déjà traités sans demande explicite.
- Ne pas considérer la compilation comme une validation du design : un build réussi ne prouve pas que le rendu respecte la référence.

## 7. Format de consigne à suivre

Chaque mission doit être traitée comme une tâche limitée :

- **Objectif :** ce qui doit être obtenu.
- **Référence :** capture, écran, commit ou fichier à respecter.
- **Périmètre autorisé :** fichiers et composants que l'agent peut modifier.
- **À préserver :** comportements, couleurs, placements et éléments qui ne doivent pas changer.
- **Validation attendue :** build, tests, captures et compte rendu demandés.

Si un élément essentiel manque ou si deux consignes se contredisent, pose une question ciblée avant de prendre une décision irréversible.

---

**Principe final :** ChatGPT pilote l'analyse UI et les corrections de source ; DeepSeek assure l'intégration technique, la compilation et la vérification du résultat ; l'utilisateur valide le rendu. Le travail avance par corrections limitées, vérifiables et successives.