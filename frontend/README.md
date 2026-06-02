# Frontend EIG (Next.js)

Frontend sépare du backend Laravel.

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Copie `.env.local.example` vers `.env.local` :

```bash
cp .env.local.example .env.local
```

Valeur attendue :

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Pages principales

- `/connexion`
- `/partenaires/inscription`
- `/verification`
- `/inscription`
- `/dashboard`
- `/admin`
