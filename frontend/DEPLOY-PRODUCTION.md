# Déploiement frontend — production (Genius Pay)

## Variables d'environnement

Sur **Vercel** (repo `ambassadeur`, dossier `frontend`) ou **Partnext** :

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_BASE_URL=https://api.partnext.org/api/v1
```

Le fichier `frontend/.env.production` contient déjà ces valeurs pour le build.

## Prérequis backend (avant tests réels)

Le backend doit être déployé avec au minimum :

```env
PAYMENT_DRIVER=geniuspay
GENIUSPAY_API_KEY=pk_sandbox_...
GENIUSPAY_API_SECRET=sk_sandbox_...
GENIUSPAY_WEBHOOK_SECRET=whsec_...
GENIUSPAY_BASE_URL=https://pay.genius.ci/api/v1/merchant
GENIUSPAY_PAYOUT_WALLET_ID=4a9a1466-4844-4b74-98db-024f645f47ad
APP_FRONTEND_URL=https://ambassadeur.partnext.org
```

Webhook Genius Pay (recommandé) :

```
https://api.partnext.org/api/v1/payments/geniuspay/webhook
```

## Déploiement Vercel

1. Repo : `freddy2122/ambassadeur`
2. **Root Directory** : `frontend`
3. Variables ci-dessus
4. Build : `npm run build` (Next.js export statique)

## Déploiement Partnext

1. Repo : `freddy2122/eig_part`
2. Synchroniser le dossier `frontend/` vers la racine si votre hébergement l'exige
3. Même variables d'environnement au build
4. URL : `https://ambassadeur.partnext.org`

## Parcours à tester après déploiement

| Parcours | URL / action |
|----------|----------------|
| Inscription + paiement | `/inscription` → checkout Genius Pay sandbox |
| Retrait ambassadeur | `/dashboard/paiements` (wallet API Payout rechargé) |
| Admin payouts | `/admin/payouts` |

## Mode démo (sans API)

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Voir `DEPLOY-DEMO.md` pour le parcours de démonstration.
