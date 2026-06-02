# Déploiement frontend — mode démo

## 1. Activer le mode démo (sans API)

Dans les variables d'environnement de votre hébergeur (Vercel, Netlify, etc.) :

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Rebuild et déployez. Aucune API n'est requise.

## 2. Parcours de test

1. **Accueil** — stats et contenu statiques ; bouton **« Voir la démo »** → dashboard direct
2. **Connexion** — n'importe quel e-mail / mot de passe, ou `demo@eigambassadors.com` / `demo1234`
3. **Dashboard** — code AMB-025, challenge, classement, gains
4. **Inscription** — redirige directement vers le dashboard en mode démo

Une bannière jaune indique que les données sont fictives.

## 3. Brancher l'API réelle (après approbation)

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_BASE_URL=https://votre-api-laravel.com/api/v1
```

Redéployez le frontend.
