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

Voir `frontend/DEPLOY-DEMO.md` pour le détail.

## Développement local

```bash
# Frontend
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_DEMO_MODE=true
npm install
npm run dev
```

```bash
# Backend (optionnel)
cd backend
composer install
cp .env.example .env
php artisan migrate
php artisan serve
```

## Repository

https://github.com/freddy2122/ambassadeur
