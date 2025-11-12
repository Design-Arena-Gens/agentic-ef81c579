export type KnowledgeEntry = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keywords: string[];
  response: string;
  autoSteps?: string[];
};

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'welcome',
    title: 'Message de bienvenue',
    description:
      "Réponse par défaut lorsqu'un nouveau client démarre une conversation ou dit bonjour.",
    tags: ['onboarding', 'general'],
    keywords: ['bonjour', 'bonsoir', 'hello', 'salut', 'hi', 'help'],
    response:
      "Bonjour ! 👋 Merci de contacter SafeGuardian. Je suis l'assistant virtuel et je peux vous aider immédiatement. Expliquez-moi votre demande ou votre incident et je m'occupe de tout."
  },
  {
    id: 'reset-password',
    title: 'Réinitialisation du mot de passe',
    description: 'Guide pour réinitialiser un mot de passe SafeGuardian.',
    tags: ['support', 'auth'],
    keywords: ['mot de passe', 'password', 'mdp', 'reset', 'réinitialiser'],
    response:
      "Pas de panique ! Pour réinitialiser votre mot de passe SafeGuardian :\n1. Rendez-vous sur la page de connexion\n2. Cliquez sur \"Mot de passe oublié\"\n3. Saisissez l'adresse e-mail utilisée pour créer le compte\n4. Cliquez sur le lien reçu par e-mail et choisissez un nouveau mot de passe sécurisé\n\nSi vous ne recevez pas l'e-mail, vérifiez vos spams ou envoyez-moi l'adresse concernée pour que je relance l'envoi."
  },
  {
    id: 'incident-report',
    title: 'Déclaration d’incident',
    description: 'Procédure pour enregistrer un incident.',
    tags: ['incident', 'sécurité'],
    keywords: ['incident', 'alerte', 'danger', 'urgence', 'attaque'],
    response:
      "Merci pour votre vigilance. Pour que je puisse intervenir efficacement, j’ai besoin des informations suivantes :\n- Description précise de l’incident\n- Date et heure\n- Personnes ou zones impactées\n- Mesures déjà prises\n\nDès que j’ai ces éléments, je rédige le rapport d’incident et j’alerte le niveau de support adapté."
  },
  {
    id: 'pricing',
    title: 'Demande de tarification',
    description: 'Réponse concernant les tarifs.',
    tags: ['pricing', 'commercial'],
    keywords: ['prix', 'tarif', 'abonnement', 'facturation', 'coût'],
    response:
      "Nos offres SafeGuardian s’adaptent à la taille de votre organisation et au niveau de protection souhaité. Pour vous envoyer une proposition personnalisée, j’ai besoin :\n- Du nombre de sites ou filiales à protéger\n- Du volume d’utilisateurs\n- Des contraintes de conformité spécifiques\n\nTransmettez-moi ces informations et je vous prépare un devis détaillé sous 24h."
  },
  {
    id: 'integration',
    title: 'Assistance intégration',
    description: 'Procédure pour connecter SafeGuardian à un SI existant.',
    tags: ['intégration', 'technique'],
    keywords: ['intégration', 'api', 'webhook', 'connexion', 'crm'],
    response:
      "Bonne nouvelle : SafeGuardian s'intègre facilement à votre SI. Pour démarrer, je vous conseille de :\n1. Créer une clé API dans l’onglet Intégrations\n2. Autoriser les adresses IP listées dans la documentation\n3. Définir les événements que vous souhaitez recevoir via Webhook\n\nJe peux générer un guide pas-à-pas adapté à votre environnement si vous me précisez votre CRM ou outil cible."
  },
  {
    id: 'fallback',
    title: 'Réponse générique',
    description: 'Utilisée lorsqu’aucune entrée spécifique ne correspond.',
    tags: ['fallback'],
    keywords: [],
    response:
      "Merci pour votre message. Je suis en train d’analyser votre demande pour vous proposer la meilleure solution. Pour gagner du temps, pouvez-vous préciser le contexte, les utilisateurs impactés et l’urgence ? Pendant ce temps, je vérifie nos procédures internes et les journaux d’incident."
  }
];
