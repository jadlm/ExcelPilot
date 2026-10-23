# ExcelPilot AI

Application React/Vite d'analyse de fichiers Excel et CSV. Les fichiers sont lus dans le navigateur. L'assistant IA distant est optionnel, passe par une route serveur et ne recoit pas de donnees tant que le client n'a pas donne son consentement.

## Fonctionnalites

- Import local multi-fichiers `.xlsx`, `.xls`, `.csv` et `.ods`; toutes les feuilles sont chargees avec provenance fichier/feuille.
- Limites import: 20 Mo par fichier, 100 Mo par selection.
- Vue globale, indicateurs commerciaux, graphique en perspective, aperçu des donnees, recherche, controle qualite et exports XLSX/CSV.
- Associations editables pour quantite, prix de vente et cout; les totaux deviennent indisponibles si une valeur requise manque.
- Assistant compact avec reponses deterministes locales pour resume, CA/marge, doublons et valeurs manquantes.
- Questions libres via fournisseur OpenAI-compatible cote serveur, apres consentement explicite. Les secrets ne sont jamais inclus dans le bundle navigateur.
- Logo fourni integre dans la barre laterale et comme favicon.

## Developpement

Prerequis: Node.js 20+ et npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Pour activer les questions libres, renseigner dans `.env`:

```env
AI_API_KEY=...
AI_MODEL=...
AI_API_URL=https://api.openai.com/v1/chat/completions
```

La cle reste cote serveur. `AI_API_URL` est facultative pour l'API OpenAI; un endpoint compatible Chat Completions peut etre utilise. Sans cle ou modele, les calculs locaux fonctionnent et l'interface affiche le mode local.

## Tests et build

```powershell
npm test
npm run build
npm run preview
```

Les tests moteur et route IA sont dans `tests/`. Le build peut afficher un avertissement de bundle JavaScript volumineux.

## Hebergement Vercel

Le depot comprend `vercel.json` et les fonctions `api/chat.js` et `api/status.js`. Importer le depot GitHub dans Vercel, conserver `npm run build` et `dist`, puis definir `AI_API_KEY`, `AI_MODEL` et eventuellement `AI_API_URL` dans les variables d'environnement serveur du projet Vercel. Ne jamais ajouter ces secrets a GitHub. Le domaine public et le service IA ne sont pas encore deployes/configures depuis ce depot local.

## Confidentialite et limites

Les questions simples sur les chiffres et la qualite restent locales. Pour une question libre, le client doit cocher le consentement dans l'assistant; le contexte (colonnes, lignes, resume de calcul) est alors envoye au fournisseur configure. Les requetes sont limitees a 8 par minute par instance, a 25 secondes et a environ 180 Ko de contexte. Les limites IP en memoire sont indicatives sur une plateforme serverless et ne remplacent pas un quota persistant ni l'authentification utilisateur.

Pas encore de comptes, isolation de donnees multi-utilisateurs, stockage cloud, quota durable, paiements, rapports PDF, taux TVA, calcul de stock ou annulation du nettoyage. Le fournisseur doit etre configure et teste avant d'annoncer une IA active en production.

Le fournisseur OpenAI utilise par defaut l'endpoint Chat Completions documente ici: https://platform.openai.com/docs/api-reference/chat/create
