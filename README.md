# SafeGuardian AI Control Center

Plateforme Next.js prête pour Vercel qui pilote un agent IA autonome sur l’app SafeGuardian (`appId: 690e7bf293df47111a4c12be`). L’interface centralise l’authentification, la gestion temps réel des conversations, l’automatisation des réponses et la base de connaissances utilisée par le bot.

## ✨ Fonctionnalités clefs

- **Connexion sécurisée** au back-office Base44 via cookies HTTP-only (refresh automatique des tokens).
- **Dashboard opérateur** : aperçu des agents, canaux actifs et playbooks IA embarqués.
- **Console conversations** : filtrage (ouvertes/en attente/etc.), lecture en continu des messages, réponses humaines et déclenchement instantané de l’IA.
- **Automatisation illimitée** : déclencheur manuel ou via Cron Vercel sur `POST /api/automation/run`, avec logs détaillés (confiance, playbook utilisé).
- **Base de connaissances intégrée** : playbooks éditables dans `data/knowledge-base.ts` pour ajuster les réponses.

## 🚀 Lancer le projet

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer l’environnement local :
   ```bash
   npm run dev
   ```
3. Se rendre sur `http://localhost:3000` et se connecter avec un compte SafeGuardian/Base44.

### Variables d’environnement

Toutes optionnelles (valeurs par défaut incluses) :

| Variable | Description | Valeur par défaut |
| --- | --- | --- |
| `BASE44_APP_ID` | Identifiant d’app Base44 | `690e7bf293df47111a4c12be` |
| `BASE44_SERVER_URL` | Endpoint serveur Base44 | `https://app.base44.com` |
| `BASE44_DEFAULT_AGENT` | Agent sélectionné par défaut | `support` |

> Les tokens sont stockés côté serveur dans des cookies `sg_access_token` et `sg_refresh_token`.

## 🧠 Personnalisation IA

- Modifier/ajouter des playbooks dans `data/knowledge-base.ts`.
- Adapter l’algorithme de matching dans `lib/agent/policy.ts`.
- Étendre l’automatisation (outils, tagging, analytics) dans `lib/agent/automation.ts`.

## 🛠️ Scripts utiles

- `npm run dev` – serveur de développement
- `npm run build` – build production
- `npm run start` – serveur production
- `npm run lint` – lint via ESLint

## 📦 Déploiement Vercel

1. Construire localement : `npm run build`
2. Déployer : `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ef81c579`
3. Vérifier : `curl https://agentic-ef81c579.vercel.app`

## 📁 Structure principale

```
app/
  api/                # Routes Next.js (auth, conversations, automation…)
  dashboard/          # Pages dashboard (overview, conversations, automation, knowledge)
  layout.tsx          # Layout global
components/           # UI et composants métier
data/knowledge-base.ts# Playbooks
lib/                  # Clients Base44, agent IA, utilitaires
```

---

SafeGuardian AI Control Center est pensé pour gérer un volume illimité de conversations et offrir une expérience 100% autonome, tout en laissant la main aux opérateurs pour ajuster ou reprendre les échanges à tout moment. Ajustez librement la base de connaissances et les flux d’automatisation selon vos besoins.*** End Patch मैं
