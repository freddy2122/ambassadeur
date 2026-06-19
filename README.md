# EIG Ambassadors

Programme ambassadeur EIG — frontend Next.js + API Laravel.

## Structure

| Dossier | Description |
|---------|-------------|
| `frontend/` | Application Next.js (interface ambassadeur) |
| `backend/` | API Laravel |

## Déploiement démo (sans API)

1. Hébergeur recommandé : [Vercel](https://vercel.com)
2. **Root Directory** du projet : `frontend`
3. Variable d'environnement :
   ```env
   NEXT_PUBLIC_DEMO_MODE=true
   ```

Voir `DEPLOY-DEMO.md` pour le détail (mode démo sans API).

Pour la production avec Genius Pay et l'API réelle : `DEPLOY-PRODUCTION.md`.

## Développement local (API réelle)

**Backend** (terminal 1) :
```bash
cd backend
php artisan serve
# API : http://127.0.0.1:8000/api/v1
```

**Frontend** (terminal 2) :
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Dans `backend/.env`, vérifier :
- `APP_FRONTEND_URL=http://localhost:3000`
- `CORS_ALLOWED_ORIGINS` inclut `http://localhost:3000`

Dans `frontend/.env.local` :
```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Pour un aperçu sans API : `NEXT_PUBLIC_DEMO_MODE=true`

## Repository

https://github.com/freddy2122/ambassadeur
