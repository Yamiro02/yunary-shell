/**
 * Les chaînes FR communes à toutes les apps — erreurs, auth, layout, paramètres,
 * formules, légal, audit, profil créateur. Français seul : pas de mécanisme i18n, un objet.
 * Les libellés viennent des MAQUETTES (maîtres) ; la v1 a servi de repli quand la maquette
 * ne disait rien. Les interpolations sont des fonctions, pas des gabarits.
 */
export const fr = {
  common: {
    loading: 'Chargement',
    retry: 'Réessayer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    soon: 'Bientôt',
    or: 'ou',
    saved: 'Enregistré',
    saving: 'Enregistrement…',
    errorTitle: 'Quelque chose a planté',
    errorBody: 'Une erreur inattendue est survenue. Recharge la page pour réessayer.',
    reload: 'Recharger',
  },

  errors: {
    auth: {
      invalidCredentials: 'E-mail ou mot de passe incorrect.',
      emailNotConfirmed: "Confirme d'abord ton e-mail avant de te connecter.",
      emailAlreadyRegistered: 'Un compte existe déjà avec cet e-mail.',
      passwordTooShort: 'Mot de passe trop court : 8 caractères minimum.',
      passwordWeak: 'Le mot de passe doit contenir une minuscule, une majuscule et un chiffre.',
      invalidOrExpiredLink: 'Lien invalide ou expiré. Redemande un lien de réinitialisation.',
      sessionExpired: 'Session expirée. Reconnecte-toi.',
      samePassword: "Le nouveau mot de passe doit être différent de l'ancien.",
    },
    rateLimit: 'Trop de tentatives. Réessaie dans quelques instants.',
    network: 'Connexion impossible. Vérifie ta connexion internet.',
    generic: 'Une erreur est survenue. Réessaie.',
    portalFailed: "Impossible d'ouvrir la gestion de facturation. Réessaie.",
    checkoutFailed: "Impossible d'ouvrir le paiement. Réessaie.",
    accountDeleteFailed: 'La suppression du compte a échoué. Réessaie.',
    insufficientCredits: 'Crédits insuffisants.',
    image: {
      canvas: 'Canvas indisponible dans ce navigateur.',
      prepare: "Impossible de préparer l'image.",
      format: 'Format non pris en charge : choisis une image JPG, PNG ou WebP.',
      tooLarge: 'Image trop lourde : 2 Mo maximum.',
    },
  },

  auth: {
    fields: {
      email: 'E-mail',
      emailPlaceholder: 'toi@exemple.com',
      password: 'Mot de passe',
      passwordPlaceholder: 'Ton mot de passe',
      passwordChoose: 'Choisis un mot de passe',
      passwordConfirm: 'Confirme ton mot de passe',
      passwordConfirmPlaceholder: 'Retape ton mot de passe',
      passwordHint: '8 caractères minimum, avec une minuscule, une majuscule et un chiffre.',
    },
    validation: {
      emailRequired: 'E-mail requis.',
      emailInvalid: 'E-mail invalide.',
      passwordRequired: 'Mot de passe requis.',
      passwordMin: '8 caractères minimum.',
      passwordChars: 'Il faut au moins une minuscule, une majuscule et un chiffre.',
      passwordConfirmRequired: 'Confirme ton mot de passe.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
    },
    actions: {
      google: 'Continuer avec Google',
      apple: 'Continuer avec Apple',
      backToLogin: 'Revenir à la connexion',
    },
    login: {
      title: 'Content de te revoir',
      forgot: 'Mot de passe oublié ?',
      submit: 'Se connecter',
      noAccount: 'Pas encore de compte ?',
      signupLink: 'Créer un compte',
    },
    signup: {
      title: 'Crée ton compte',
      subtitle: 'Tu es à quelques clics de créer des vidéos captivantes, engageantes et virales.',
      submit: 'Créer mon compte',
      hasAccount: 'Déjà un compte ?',
      loginLink: 'Se connecter',
      confirmTitle: 'Vérifie ta boîte mail',
      confirmBody: (email: string) =>
        `On a envoyé un lien de confirmation à ${email}. Clique dessus pour activer ton compte, puis reviens te connecter.`,
      legalNoticeBefore: "En t'inscrivant, tu acceptes les ",
      legalNoticeCgu: 'CGU',
      legalNoticeBetween: ' et la ',
      legalNoticePrivacy: 'politique de confidentialité',
      legalNoticeAfter: '.',
    },
    forgot: {
      title: 'Mot de passe oublié ?',
      subtitle: "Entre ton e-mail, on t'envoie un lien pour le réinitialiser.",
      submit: 'Envoyer le lien',
    },
    sent: {
      title: 'Lien envoyé',
      bodyBefore: "On t'a envoyé un lien pour réinitialiser ton mot de passe à ",
      bodyAfter: '. Clique dessus pour en choisir un nouveau.',
      spam: 'Pense à regarder tes spams.',
      resend: "Renvoyer l'e-mail",
      resending: 'Envoi…',
      resent: 'E-mail renvoyé',
    },
    reset: {
      title: 'Nouveau mot de passe',
      subtitle: 'Choisis un nouveau mot de passe : 8 caractères minimum, avec une minuscule, une majuscule et un chiffre.',
      submit: 'Mettre à jour',
      updated: 'Mot de passe mis à jour.',
      linkInvalid:
        'Ce lien ne peut pas être utilisé ici : ouvre-le dans le navigateur où tu as fait la demande, ou redemande un lien.',
    },
  },

  layout: {
    tools: 'Mes outils',
    openTools: 'Ouvrir Mes outils',
    settings: 'Paramètres',
    creditsLeft: (n: number) => `${n} crédit${n > 1 ? 's' : ''} restant${n > 1 ? 's' : ''}`,
    creditsUnknown: 'Crédits indisponibles',
    creditsResetOn: (date: string) => `Recharge le ${date}`,
    menu: 'Menu',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    planLabel: (plan: string) => `Formule ${plan}`,
  },

  parametres: {
    title: 'Paramètres',
    subtitle: 'Ton compte, ton réseau, ta formule.',
    tabsAria: 'Sections des paramètres',
    tabs: {
      infos: 'Infos',
      notifications: 'Notifications',
      abonnement: 'Abonnement',
      legal: 'Légal',
    },
    infos: {
      loadError: 'Impossible de charger tes infos.',
      choosePhoto: 'Choisir une photo',
      removePhoto: 'Supprimer',
      photoHint: 'JPG, PNG ou WebP · recadrée en carré',
      prenom: 'Prénom',
      prenomPlaceholder: 'Ton prénom',
      nom: 'Nom',
      nomPlaceholder: 'Ton nom',
      email: 'E-mail',
      emailLocked: "L'e-mail ne peut pas être modifié.",
      password: 'Mot de passe',
      changePassword: 'Modifier le mot de passe',
      /* Artboard C2 : « Comptes connectés », deux rangées Instagram / TikTok (OAuth au frigo : la rangée non connectée n'agit pas encore). */
      comptes: {
        title: 'Comptes connectés',
        subtitle: "Yunary lit la liste de tes publications et leurs statistiques, y compris celles visibles de toi seul, pour analyser ton style. Jamais tes messages, et rien n'est publié à ta place.",
        none: 'Aucun compte connecté',
        connect: 'Connecter',
        note: "Si tu déconnectes un compte, Yunary n'a plus accès à ses données. Les fiches et scripts déjà générés restent dans ta bibliothèque.",
      },
      reseau: {
        title: 'Ton réseau',
        subtitle:
          'Le compte sur lequel Yunary a lu tes publications pour ton audit et ton profil créateur.',
        none: 'Aucun réseau renseigné',
        handleLabel: 'Identifiant',
        instagram: 'Instagram',
        tiktok: 'TikTok',
      },
      logoutTitle: 'Se déconnecter',
      logout: 'Se déconnecter',
    },
    password: {
      title: 'Modifier le mot de passe',
      description: 'Choisis un nouveau mot de passe : 8 caractères minimum, avec une minuscule, une majuscule et un chiffre.',
      new: 'Nouveau mot de passe',
      newPlaceholder: 'Choisis un nouveau mot de passe',
      confirm: 'Confirme le nouveau mot de passe',
      confirmPlaceholder: 'Retape ton nouveau mot de passe',
      submit: 'Mettre à jour',
      updated: 'Mot de passe mis à jour.',
    },
    notifications: {
      loadError: 'Impossible de charger tes préférences.',
      analyseTerminee: {
        label: 'Analyse terminée',
        description: "Quand ta fiche est prête (ou qu'une analyse a échoué).",
      },
      nouveauxTemplates: {
        label: 'Nouveaux templates Yunary',
        description: 'Quand on ajoute des hooks et des structures à la bibliothèque.',
      },
    },
    abonnement: {
      loadError: 'Impossible de charger ta formule.',
      billingTitle: 'Gérer ma facturation et mes factures',
      billingSubtitle: 'Moyen de paiement, historique et reçus, sur le portail sécurisé.',
      billingCta: 'Gérer ma facturation',
      billingLocked: 'Disponible avec une formule payante',
      yourPlan: 'Ta formule',
      activationPlan: "Forfait d'activation · sans carte bleue",
      monthlyPlan: 'Rechargée chaque mois',
      creditsThisMonth: 'crédits ce mois-ci',
      resetOnFree: (date: string) =>
        `Recharge le ${date}. Passe à une formule payante pour recharger chaque mois.`,
      resetOnPaid: (date: string) => `Recharge le ${date}.`,
      changePlan: 'Changer de formule',
      currentPlan: 'Ta formule actuelle',
      choose: 'Choisir',
      soon: 'Bientôt',
      recommended: 'Recommandée',
      perMonth: '/mois',
      priceUnknown: '— €',
      creditsUnknown: '— crédits/mois',
    },
    legal: {
      cgu: "Conditions générales d'utilisation",
      mentions: 'Mentions légales',
      confidentialite: 'Politique de confidentialité',
      danger: {
        title: 'Supprimer mon compte',
        description:
          'Suppression définitive de toutes tes données (vidéos, fiches, scripts, crédits) et résiliation immédiate de ton abonnement, sans remboursement de la période en cours.',
        cta: 'Supprimer mon compte',
      },
      deleteDialog: {
        title: 'Supprimer ton compte ?',
        description: 'Cette action est immédiate et irréversible.',
        bulletData:
          'Toutes tes données sont supprimées définitivement : vidéos analysées, fiches, scripts, profil créateur et crédits.',
        bulletBilling:
          'Ton abonnement est résilié immédiatement, sans remboursement du reste de la période en cours.',
        typeToConfirm: (word: string) => `Tape ${word} pour confirmer`,
        confirmWord: 'SUPPRIMER',
        confirm: 'Supprimer mon compte',
        busy: 'Suppression…',
        deleted: 'Ton compte a été supprimé. À bientôt peut-être !',
      },
    },
  },

  formules: {
    free: {
      name: 'Gratuite',
      features: ["50 crédits offerts à l'inscription", 'Analyse et Création inclus', 'Sans carte bleue'],
    },
    createur: {
      name: 'Créateur',
      features: ['— crédits/mois', "Tous les outils, sans limite d'accès", 'Recharge automatique chaque mois'],
    },
    pro: {
      name: 'Pro',
      features: ['— crédits/mois', 'Tout Créateur, en plus grand volume', 'Accès prioritaire aux nouveaux outils'],
    },
  },

  legal: {
    lastUpdated: (date: string) => `Dernière mise à jour : ${date}`,
    back: 'Retour',
    topbar: { cgu: 'CGU', mentions: 'Mentions légales', confidentialite: 'Confidentialité' },
    deletion: {
      title: 'Suppression de vos données',
      checking: 'Vérification de votre demande…',
      missing:
        "Cette page permet de vérifier l'état d'une demande de suppression de données initiée depuis Instagram. Aucun code de confirmation n'est présent dans l'adresse : utilisez le lien fourni lors de votre demande.",
      notFound:
        'Aucune demande ne correspond à ce code de confirmation. Les demandes de plus de 90 jours sont purgées de nos registres, la suppression, elle, reste bien effective.',
      error: 'Impossible de vérifier votre demande pour le moment. Réessayez dans quelques instants.',
      completed:
        'Votre demande a été traitée : la connexion de votre compte Instagram à Yunary et les données associées ont été supprimées.',
      failed:
        'Votre demande a été reçue mais son traitement a rencontré une erreur. Elle sera rejouée automatiquement ; si le problème persiste, contactez-nous.',
      receivedOn: (date: string) => `Demande reçue le ${date}`,
    },
  },

  audit: {
    synthese: 'En résumé',
    profil: {
      title: 'Ton profil',
      bioTitle: "Ta bio actuelle, telle qu'on la voit",
      photo: 'Photo de profil',
      meta: (publications: number, abonnes: string, suivis: number | null) =>
        [
          `${publications} publications`,
          `${abonnes} abonnés`,
          suivis !== null ? `${suivis} suivi(e)s` : null,
        ]
          .filter(Boolean)
          .join(' · '),
    },
    dimensions: { clarte: 'Positionnement', structure: 'Structure', coherence_contenu: 'Cohérence avec ton contenu' },
    bioEtat: { solide: 'Solide', a_travailler: 'À travailler' },
    chiffres: { title: 'Tes chiffres clés', suffix: '· moyenne par vidéo' },
    tiles: {
      vuesMoyennes: 'Vues moyennes',
      rythme: 'Rythme',
      parSemaine: '/ semaine',
      watchTime: 'Watch time moyen',
      tendance: { hausse: 'En hausse', stable: 'Stable depuis 3 mois', baisse: 'En baisse' },
      creux: (jours: number) => `Jusqu'à ${jours} jours sans publier`,
      dureeMoyenne: (s: number) => `Vidéos d'environ ${s} s`,
    },
    engagement: {
      title: 'Engagement',
      likes: 'likes',
      commentaires: 'commentaires',
      partages: 'partages',
      enregistrements: 'enregistrements',
    },
    verdicts: {
      title: 'Le verdict, axe par axe',
      surperforme: 'Surperforme',
      dans_la_moyenne: 'Dans la moyenne',
      sous_performe: 'Sous-performe',
      non_evaluable: 'Non évaluable',
      faible: 'Faible',
      correct: 'Correct',
      fort: 'Fort',
    },
    axes: { portee: 'Portée', engagement: 'Engagement', education: 'Éducation', regularite: 'Régularité', profil: 'Profil' },
    prose: 'Ce que tes chiffres racontent',
    points: { marche: 'Ce qui marche', ameliorer: 'À améliorer' },
    nonEvaluable: {
      title: 'Encore un peu de matière, et on te dit tout',
      body: (count: number, min: number) =>
        `Ton compte a ${count} publication${count > 1 ? 's' : ''} récente${count > 1 ? 's' : ''}, il en faut au moins ${min} pour un bilan chiffré qui veuille dire quelque chose. Plutôt que de te montrer des moyennes bancales, on préfère attendre. Continue de publier : ton audit se lancera tout seul, sans rien te demander.`,
      /* La jauge de l'artboard 09b : « 2 » · « / 3 publications récentes » · « Plus qu'une ». */
      compteur: (min: number) => `/ ${min} publications récentes`,
      reste: (n: number) => (n <= 1 ? "Plus qu'une" : `Plus que ${n}`),
      /* Rassurance d'onboarding : passée par l'app hôte en `nonEvaluableNote`, jamais rendue d'office. */
      profilReady:
        "Ton profil créateur, lui, arrive à l'étape suivante : chaque hook et chaque script retravaillé dans Yunary sonnera comme toi.",
    },
    error: {
      title: "Ton audit n'a pas pu être calculé",
      body: "Rien n'est perdu et aucun crédit n'a été débité.",
    },
  },

  profil: {
    niche: { title: 'Ta niche', otherPlaceholder: 'Précise ta niche', other: 'Autre' },
    voix: {
      title: 'Ta voix',
      niveauLabel: 'Niveau de langue',
      niveau: { soutenu: 'Soutenu', naturel: 'Naturel', familier: 'Familier', cru: 'Cru' },
      vulgariteLabel: 'Vulgarité',
      vulgarite: { jamais: 'Jamais', rare: 'Rare', assumee: 'Assumée' },
      humourLabel: 'Humour',
      humour: {
        autoderision: 'Autodérision',
        noir: 'Humour noir',
        ironie_second_degre: 'Ironie & second degré',
        pince_sans_rire: 'Pince-sans-rire',
        absurde: 'Absurde',
        aucun: 'Aucun',
      },
      expressions: 'Tes expressions signature',
      quoted: (text: string) => `« ${text} »`,
    },
    avatar: {
      title: 'Ton avatar cible',
      qui: 'Qui',
      quoi: 'Quoi',
      probleme: 'Son problème',
    },
    positions: {
      title: 'Tes prises de position',
      subtitle:
        "Les convictions que tu défends dans tes vidéos : ce qui donne un angle à ton contenu et fait qu'on te suit toi plutôt qu'un autre.",
    },
  },
} as const;

export type Fr = typeof fr;
