/** Active le mode démo (données en dur, sans API). Mettre à "false" pour brancher l'API réelle. */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_TOKEN = "demo-eig-ambassadors-token";

/** Identifiants suggérés affichés sur la page connexion (tout email/mot de passe fonctionne en démo). */
export const DEMO_LOGIN_HINT = {
  email: "demo@eigambassadors.com",
  password: "demo1234",
};
