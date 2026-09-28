# ImmoFrançais

Site vitrine immobilier (React + Vite + Tailwind), en ligne sur **https://immo-francais.fr** (avec tiret).
Réponds toujours en français, simplement : l'utilisateur n'est pas développeur.

## Mise en ligne
- Tout envoi sur la branche `master` de GitHub (`FloconSA/immofrancais.fr`, dépôt **public**) est publié automatiquement par Netlify en 1 à 2 minutes.
- Vérifie `npx tsc --noEmit` et `npm run build` avant d'envoyer.
- `immofrancais.fr` (sans tiret) n'appartient pas à l'utilisateur : ne pas s'en occuper.

## Annonces (backend Strapi 5)
Les annonces ne sont pas dans ce code : elles sont dans Strapi, hébergé sur Railway.
- API : `https://backend-immo-production-7c35.up.railway.app` (voir `API_URL` dans `src/constants.ts`)
- Admin (pour l'utilisateur) : `https://backend-immo-production-7c35.up.railway.app/admin`
- Code du backend : `C:\Users\flori\mon-backend-immo` (modèle : `src/api/house/content-types/house/schema.json`)
- Clé d'accès : variable `STRAPI_TOKEN` dans le fichier `.env` de ce dossier. Lis-la depuis le fichier dans tes commandes, ne l'affiche jamais, ne la recopie jamais dans la conversation ni dans un fichier suivi par git.

### Champs d'une annonce (`house`)
| Champ | Type | Exemple |
|---|---|---|
| `name` | texte (titre) | `Dernier étage – Four` |
| `type` | texte (sous-titre) | `Appartement 2 pièces avec balcon` |
| `price` | nombre entier (€) | `150000` |
| `rooms` / `bedrooms` | entiers | `2` / `1` |
| `surface` | décimal (m²) | `45.76` |
| `description` | texte long | paragraphes séparés par des retours à la ligne |
| `caracteristics` | une ligne par élément | `Année de construction : 2012` |
| `facilities` | une ligne par élément | `Balcon` |
| `DPE` / `GES` | une lettre de A à G | `C` |
| `images` | liste d'identifiants de fichiers envoyés | la 1re photo sert de vignette |

### Comment faire
- Lister : `GET /api/houses?populate=*` (les annonces sont identifiées par `documentId`)
- Envoyer des photos : `POST /api/upload` en multipart (`files=@photo.jpg`), récupérer les `id` renvoyés
- Créer en brouillon : `POST /api/houses?status=draft` avec `{"data": {...}}`
- Modifier : `PUT /api/houses/<documentId>?status=draft` avec `{"data": {...}}`
- Publier : `PUT /api/houses/<documentId>?status=published`
- En-tête : `Authorization: Bearer $STRAPI_TOKEN`

### Règles
- Crée ou modifie toujours **en brouillon d'abord**, montre un récapitulatif à l'utilisateur, et **ne publie qu'après son accord explicite**.
- Ne supprime jamais une annonce ou une photo sans accord explicite.
- Photos : si elles sont très lourdes (plus de 5 Mo), propose de les réduire avant l'envoi.
- Si une info manque (DPE, surface…), demande-la plutôt que de l'inventer.
