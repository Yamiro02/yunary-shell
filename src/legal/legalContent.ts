/**
 * Contenu des pages légales — COPIE VERBATIM de `legacy-v1/app/src/i18n/locales/fr/legal.json`
 * (généré par script, jamais retouché à la main ici). Ces textes sont conformes aux reviews
 * Meta / TikTok et FIGÉS ; seul le médiateur de la consommation (art. 10 des CGU) reste à
 * compléter. Registre formel (vouvoiement). Une modification se fait dans la v1 puis se
 * régénère ici — jamais l'inverse.
 */
export type LegalBlock = { type: 'p'; text: string } | { type: 'list'; items: string[] };
export interface LegalSection { heading: string; blocks: LegalBlock[] }
export interface LegalDoc { title: string; updated: string; intro: string; sections: LegalSection[] }
export type LegalDocId = 'cgu' | 'mentions' | 'confidentialite';

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  "cgu": {
    "title": "Conditions générales d'utilisation",
    "updated": "9 août 2026",
    "intro": "Les présentes conditions générales d'utilisation (les « CGU ») régissent l'accès et l'utilisation du service Yunary. En créant un compte ou en utilisant le service, vous acceptez les présentes CGU sans réserve.",
    "sections": [
      {
        "heading": "1. Objet du service",
        "blocks": [
          {
            "type": "p",
            "text": "Yunary est un service en ligne (SaaS) édité par Julien FERNANDES – Entrepreneur individuel (EI) (voir les mentions légales). Il permet aux créateurs de contenu d'analyser des vidéos courtes (accroche, structure narrative, format visuel, copywriting) et de générer, à l'aide de modèles d'intelligence artificielle, des scripts personnalisés calés sur leur profil éditorial."
          },
          {
            "type": "p",
            "text": "Le service repose sur deux usages complémentaires. D'une part, vous pouvez connecter votre propre compte Instagram professionnel ou TikTok : Yunary analyse alors vos publications et leurs statistiques, y compris celles visibles de vous seul, pour construire votre profil créateur et générer des scripts à votre voix. Cette connexion est facultative, soumise à votre autorisation explicite et révocable à tout moment ; le détail des données concernées figure à l'article 3 de la politique de confidentialité. D'autre part, vous pouvez soumettre le lien d'une vidéo publiquement accessible pour l'analyser, à des fins d'étude et d'inspiration."
          },
          {
            "type": "p",
            "text": "Yunary n'est ni affilié, ni sponsorisé, ni approuvé par Instagram (Meta Platforms, Inc.) ou TikTok (TikTok Pte. Ltd.). L'analyse porte exclusivement sur vos propres publications, lorsque vous connectez un compte, ou sur des contenus rendus publics par leurs auteurs."
          }
        ]
      },
      {
        "heading": "2. Compte utilisateur",
        "blocks": [
          {
            "type": "p",
            "text": "L'utilisation du service nécessite la création d'un compte, par e-mail et mot de passe ou via Google. Vous vous engagez à fournir des informations exactes et à les maintenir à jour."
          },
          {
            "type": "p",
            "text": "Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte. Le service est réservé aux personnes majeures ou mineures disposant de l'autorisation de leur représentant légal."
          }
        ]
      },
      {
        "heading": "3. Crédits, formules et abonnements",
        "blocks": [
          {
            "type": "p",
            "text": "Les actions du service (analyse d'une vidéo, génération ou édition d'un script) consomment des crédits. Le solde de crédits et le coût de chaque action sont affichés dans l'application."
          },
          {
            "type": "list",
            "items": [
              "Un forfait gratuit d'activation, composé de crédits non renouvelables, peut être accordé à la création du compte.",
              "Les formules payantes prennent la forme d'abonnements donnant droit à une allocation de crédits, renouvelée à chaque cycle de facturation.",
              "Le paiement est opéré par Stripe. Yunary ne stocke aucune donnée bancaire.",
              "Les crédits n'ont aucune valeur monétaire, ne sont ni cessibles ni remboursables, et sont perdus à la clôture du compte."
            ]
          },
          {
            "type": "p",
            "text": "Vous pouvez gérer ou résilier votre abonnement à tout moment depuis votre espace de facturation. Sauf indication contraire, la résiliation prend effet à la fin de la période en cours. Cas particulier : la suppression du compte entraîne la résiliation immédiate de l'abonnement, sans remboursement de la période restante (voir l'article 8)."
          }
        ]
      },
      {
        "heading": "4. Contenus analysés",
        "blocks": [
          {
            "type": "p",
            "text": "Vous soumettez au service des liens vers des contenus publiquement accessibles. Vous vous interdisez de soumettre des contenus privés, obtenus de manière illicite ou dont l'analyse porterait atteinte aux droits de tiers."
          },
          {
            "type": "p",
            "text": "Les fiches d'analyse produites par le service (résumé, transcription, structure, enseignements) sont destinées à votre usage personnel au sein du service. Elles ne confèrent aucun droit sur les contenus originaux analysés, qui demeurent la propriété de leurs auteurs."
          }
        ]
      },
      {
        "heading": "5. Contenus générés et propriété intellectuelle",
        "blocks": [
          {
            "type": "p",
            "text": "Sous réserve du paiement des sommes dues et du respect des présentes CGU, les scripts générés par le service à partir de votre profil et de vos instructions peuvent être librement utilisés, modifiés et exploités par vous, y compris à des fins commerciales, dans la limite des droits que la loi permet de conférer sur des productions assistées par intelligence artificielle."
          },
          {
            "type": "p",
            "text": "Les contenus générés par intelligence artificielle peuvent comporter des inexactitudes ou des similitudes avec des contenus existants. Il vous appartient de les vérifier, de les adapter et de vous assurer que leur publication ne porte pas atteinte aux droits de tiers."
          },
          {
            "type": "p",
            "text": "Le service, sa marque, son interface, ses bases de données et ses éléments logiciels demeurent la propriété exclusive de l'éditeur. Aucune disposition des présentes ne vous confère de droit sur ces éléments."
          }
        ]
      },
      {
        "heading": "6. Usage acceptable",
        "blocks": [
          {
            "type": "p",
            "text": "Vous vous interdisez notamment :"
          },
          {
            "type": "list",
            "items": [
              "de contourner ou tenter de contourner les mesures techniques du service (limites de crédits, contrôles d'accès, plafonds d'utilisation) ;",
              "d'utiliser le service de manière automatisée ou massive au delà d'un usage normal (extraction systématique, robots, revente de tout ou partie du service) ;",
              "d'utiliser le service pour produire ou diffuser des contenus illicites, trompeurs, diffamatoires ou portant atteinte aux droits de tiers ;",
              "de perturber le fonctionnement du service ou de porter atteinte à sa sécurité ;",
              "de partager votre compte avec des tiers."
            ]
          },
          {
            "type": "p",
            "text": "Tout manquement peut entraîner la suspension ou la résiliation du compte dans les conditions de l'article 8."
          }
        ]
      },
      {
        "heading": "7. Disponibilité et évolution du service",
        "blocks": [
          {
            "type": "p",
            "text": "L'éditeur s'efforce d'assurer un accès continu au service, sans garantie de disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mise à jour ou cas de force majeure."
          },
          {
            "type": "p",
            "text": "Le service, ses fonctionnalités et ses formules peuvent évoluer. Les modifications substantielles des présentes CGU vous seront notifiées par tout moyen approprié ; la poursuite de l'utilisation du service après notification vaut acceptation."
          }
        ]
      },
      {
        "heading": "8. Résiliation",
        "blocks": [
          {
            "type": "p",
            "text": "Vous pouvez supprimer votre compte à tout moment depuis les paramètres du profil. La suppression est immédiate et définitive : l'ensemble de vos données est supprimé et l'abonnement en cours est résilié immédiatement, sans remboursement de la période restante."
          },
          {
            "type": "p",
            "text": "L'éditeur peut suspendre ou résilier un compte en cas de manquement grave ou répété aux présentes CGU, après notification restée sans effet lorsque la nature du manquement le permet."
          }
        ]
      },
      {
        "heading": "9. Responsabilité",
        "blocks": [
          {
            "type": "p",
            "text": "Le service est fourni « en l'état », dans le cadre d'une obligation de moyens. L'éditeur ne garantit pas l'exactitude, l'exhaustivité ni la performance des analyses et des contenus générés, qui constituent une aide à la création et non un conseil professionnel."
          },
          {
            "type": "p",
            "text": "L'éditeur ne saurait être tenu responsable des contenus que vous soumettez ou publiez, de l'usage que vous faites des contenus générés, ni des indisponibilités des services tiers (plateformes analysées, prestataires d'hébergement, de paiement ou d'intelligence artificielle)."
          },
          {
            "type": "p",
            "text": "En tout état de cause, et sauf faute lourde ou dolosive, la responsabilité totale de l'éditeur est limitée au montant des sommes que vous avez effectivement versées au titre du service au cours des douze mois précédant le fait générateur."
          }
        ]
      },
      {
        "heading": "10. Droit applicable et litiges",
        "blocks": [
          {
            "type": "p",
            "text": "Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. Conformément aux articles L. 612-1 et suivants du Code de la consommation, le consommateur peut recourir gratuitement à un médiateur de la consommation : [À COMPLÉTER : médiateur désigné]."
          },
          {
            "type": "p",
            "text": "À défaut de résolution amiable, les tribunaux français seront compétents dans les conditions du droit commun."
          }
        ]
      }
    ]
  },
  "mentions": {
    "title": "Mentions légales",
    "updated": "9 août 2026",
    "intro": "Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), les informations suivantes sont portées à la connaissance des utilisateurs du service Yunary.",
    "sections": [
      {
        "heading": "Éditeur",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Nom / raison sociale : Julien FERNANDES – Entrepreneur individuel (EI)",
              "Statut : Entrepreneur individuel (régime de la micro-entreprise)",
              "Adresse : 855 rue Paul Perreaut, 71700 Tournus, France",
              "E-mail : hello@julienfernandes.com",
              "SIRET : 831 369 483 00050",
              "TVA non applicable, article 293 B du CGI",
              "Directeur de la publication : Julien Fernandes"
            ]
          }
        ]
      },
      {
        "heading": "Hébergement",
        "blocks": [
          {
            "type": "p",
            "text": "L'application web est hébergée par Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, États-Unis (www.netlify.com)."
          },
          {
            "type": "p",
            "text": "Les données du service (base de données, authentification, fichiers) sont hébergées par Supabase, Inc. (supabase.com), dans la région Europe (Paris, France)."
          }
        ]
      },
      {
        "heading": "Propriété intellectuelle",
        "blocks": [
          {
            "type": "p",
            "text": "La marque Yunary, l'interface du service, ses textes, visuels et éléments logiciels sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable de l'éditeur est interdite."
          }
        ]
      },
      {
        "heading": "Contact",
        "blocks": [
          {
            "type": "p",
            "text": "Pour toute question relative au service ou aux présentes mentions, vous pouvez écrire à hello@julienfernandes.com."
          }
        ]
      }
    ]
  },
  "confidentialite": {
    "title": "Politique de confidentialité",
    "updated": "9 août 2026",
    "intro": "La présente politique décrit les données personnelles traitées par Yunary, les finalités poursuivies et vos droits, conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés.",
    "sections": [
      {
        "heading": "1. Responsable de traitement",
        "blocks": [
          {
            "type": "p",
            "text": "Le responsable de traitement est l'éditeur du service : Julien FERNANDES – Entrepreneur individuel (EI), 855 rue Paul Perreaut, 71700 Tournus, France, joignable à hello@julienfernandes.com (voir les mentions légales)."
          }
        ]
      },
      {
        "heading": "2. Données collectées",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Données de compte : adresse e-mail, prénom et nom (facultatifs), photo de profil (facultative), identifiant Google en cas de connexion via Google.",
              "Profil éditorial (persona) : informations que vous renseignez sur votre activité de créateur (niche, audience, convictions, style), ainsi que les éléments déduits des publications que vous soumettez ou des comptes que vous connectez, avec votre accord (voir l'article 3).",
              "Données issues des comptes sociaux connectés : si vous connectez un compte Instagram professionnel ou un compte TikTok, vos informations de profil, la liste de vos publications vidéo et leurs statistiques, y compris celles visibles de vous seul. Le détail de ces données, de leur usage et de leur suppression figure à l'article 3.",
              "Contenus d'usage : liens soumis à l'analyse, fiches d'analyse, scripts générés et leur historique, collections, messages échangés avec l'assistant.",
              "Données de facturation : formule souscrite et état de l'abonnement. Les données bancaires sont traitées exclusivement par Stripe et ne sont jamais stockées par Yunary.",
              "Données techniques : journaux de connexion et d'utilisation strictement nécessaires au fonctionnement et à la sécurité du service."
            ]
          },
          {
            "type": "p",
            "text": "Les cookies utilisés se limitent à l'authentification et au maintien de la session. Le service n'utilise aucun cookie publicitaire ni traceur à des fins de profilage."
          }
        ]
      },
      {
        "heading": "3. Connexion de vos comptes Instagram et TikTok",
        "blocks": [
          {
            "type": "p",
            "text": "Yunary vous propose de connecter votre compte Instagram professionnel et/ou votre compte TikTok. Cette connexion est facultative : vous pouvez utiliser Yunary sans la faire, et vous pouvez la retirer à tout moment."
          },
          {
            "type": "p",
            "text": "Ce que nous récupérons, et pourquoi. Quand vous connectez un compte, vous autorisez Yunary à accéder, en lecture seule :"
          },
          {
            "type": "list",
            "items": [
              "à votre nom d'utilisateur, votre nom affiché, votre photo de profil, votre biographie, votre nombre d'abonnés et votre nombre de publications, pour vous identifier dans l'application, afficher le compte connecté et situer votre audience ;",
              "à la liste de vos publications vidéo (identifiant, date, durée, légende, lien, miniature), pour constituer le corpus analysé ;",
              "à leurs statistiques, y compris celles visibles de vous seul (vues, mentions J'aime, commentaires, partages, enregistrements et durée moyenne de visionnage), pour identifier les publications qui ont le mieux fonctionné ;",
              "au fichier vidéo de vos publications, uniquement pour en extraire l'audio et l'image le temps de l'analyse."
            ]
          },
          {
            "type": "p",
            "text": "Ces données servent exclusivement à construire votre profil créateur : votre style d'écriture, vos accroches, votre structure narrative, votre format visuel, afin de générer des scripts qui vous ressemblent."
          },
          {
            "type": "p",
            "text": "Ce que nous ne faisons jamais. Yunary ne publie rien à votre place, ne lit pas vos messages privés, ne répond pas à vos commentaires, ne suit ni ne contacte votre audience, et ne revend ni ne partage vos données à des fins publicitaires."
          },
          {
            "type": "p",
            "text": "Conservation. Les jetons d'accès sont stockés chiffrés et conservés tant que la connexion est active. Le fichier vidéo n'est jamais conservé : il est traité puis supprimé. Les métadonnées et statistiques sont conservées avec votre fiche tant que votre compte existe."
          },
          {
            "type": "p",
            "text": "Suppression. Vous pouvez déconnecter un compte à tout moment depuis Profil, onglet Infos, section « Réseaux sociaux » : l'autorisation est immédiatement révoquée auprès de la plateforme et les jetons sont supprimés. Vous pouvez aussi retirer Yunary directement depuis les réglages d'Instagram, ce qui déclenche automatiquement la suppression des données associées. La suppression de votre compte Yunary révoque toutes les autorisations et efface l'ensemble de vos données."
          }
        ]
      },
      {
        "heading": "4. Finalités et bases légales",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Fournir le service (compte, analyses, génération de scripts, support) : exécution du contrat.",
              "Facturer les abonnements et tenir la comptabilité : exécution du contrat et obligation légale.",
              "Assurer la sécurité du service et prévenir les abus (limites d'usage, journalisation) : intérêt légitime.",
              "Envoyer des notifications liées au fonctionnement du service (par exemple la fin d'une analyse) : exécution du contrat, avec des préférences désactivables.",
              "Connecter vos comptes Instagram et TikTok, puis analyser vos publications et leurs statistiques pour construire votre profil créateur (voir l'article 3) : votre consentement."
            ]
          },
          {
            "type": "p",
            "text": "La connexion d'un compte social repose exclusivement sur votre consentement, et non sur l'exécution du contrat : elle est facultative, et le service reste pleinement utilisable sans elle. Vous exprimez ce consentement en autorisant explicitement Yunary sur la plateforme concernée, au moment de la connexion. Vous pouvez le retirer à tout moment en déconnectant le compte, sans que ce retrait affecte la licéité du traitement effectué auparavant."
          }
        ]
      },
      {
        "heading": "5. Sous-traitants et destinataires",
        "blocks": [
          {
            "type": "p",
            "text": "Les données sont traitées par les sous-traitants suivants, chacun pour la finalité indiquée. Le lien renvoie vers la politique de confidentialité de chaque prestataire :"
          },
          {
            "type": "list",
            "items": [
              "Supabase : hébergement de la base de données, authentification et stockage de fichiers (région Europe, Paris, France). supabase.com/privacy",
              "Netlify : hébergement de l'application web. netlify.com/privacy",
              "Stripe : traitement des paiements et gestion des abonnements. stripe.com/privacy",
              "Apify : récupération des publications et du fichier vidéo à analyser à partir de son lien. apify.com/privacy-policy",
              "OpenAI : transcription de la piste audio des vidéos analysées. Seul l'audio extrait est transmis, à l'exclusion de l'image. openai.com/policies/privacy-policy",
              "Google (modèles Gemini) : analyse multimodale, image et son, des vidéos analysées. policies.google.com/privacy",
              "Anthropic (modèles Claude) : génération et édition des scripts, et synthèse de votre profil créateur. anthropic.com/legal/privacy"
            ]
          },
          {
            "type": "p",
            "text": "Aucun de ces prestataires n'est autorisé à utiliser vos données pour ses propres finalités, ni pour entraîner des modèles."
          },
          {
            "type": "p",
            "text": "Transferts hors de l'Union européenne. Les données du service sont hébergées dans l'Union européenne : la base de données, l'authentification et les fichiers sont situés dans la région Europe (Paris, France), et Apify est établi en République tchèque. Plusieurs autres prestataires sont en revanche établis aux États-Unis ou susceptibles d'y transférer des données : Supabase, Netlify, Stripe, OpenAI, Google et Anthropic. Ces transferts sont encadrés par les clauses contractuelles types adoptées par la Commission européenne le 4 juin 2021, complétées le cas échéant par un mécanisme d'adéquation applicable et par des mesures techniques et organisationnelles complémentaires. Vous pouvez obtenir copie des garanties mises en place en écrivant à hello@julienfernandes.com. Aucune donnée n'est vendue ni transmise à des tiers à des fins publicitaires."
          }
        ]
      },
      {
        "heading": "6. Durées de conservation",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Données de compte et contenus d'usage : pendant toute la durée de vie du compte, puis suppression immédiate à la clôture du compte.",
              "Jetons d'accès aux comptes sociaux connectés : conservés chiffrés pendant toute la durée de la connexion. Ils sont supprimés dès la déconnexion du compte, dès le retrait de l'autorisation depuis la plateforme, ou à la suppression de votre compte Yunary.",
              "Fichier vidéo analysé : jamais conservé. Il est traité le temps de l'analyse, pour en extraire l'audio et l'image, puis supprimé. Seuls les résultats de l'analyse sont conservés.",
              "Métadonnées et statistiques des publications importées : conservées avec votre fiche créateur pendant toute la durée de vie du compte.",
              "Données de facturation : durée légale de conservation des pièces comptables (dix ans), conservées par le prestataire de paiement.",
              "Journaux techniques : durée limitée, proportionnée aux besoins de sécurité."
            ]
          }
        ]
      },
      {
        "heading": "7. Vos droits",
        "blocks": [
          {
            "type": "p",
            "text": "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données personnelles. Vous pouvez les exercer à tout moment en écrivant à hello@julienfernandes.com. Une réponse vous sera apportée dans un délai d'un mois."
          },
          {
            "type": "p",
            "text": "Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr)."
          }
        ]
      },
      {
        "heading": "8. Suppression du compte",
        "blocks": [
          {
            "type": "p",
            "text": "Vous pouvez supprimer votre compte à tout moment depuis Profil, onglet Infos, section « Supprimer mon compte ». La suppression est immédiate : l'ensemble de vos données (analyses, scripts, collections, persona, crédits, fichiers) est définitivement supprimé et l'abonnement en cours est résilié sans remboursement de la période restante."
          },
          {
            "type": "p",
            "text": "La suppression du compte révoque également les autorisations que vous avez accordées à Yunary sur Instagram et TikTok, et efface les jetons d'accès correspondants. Vous pouvez aussi déconnecter un compte social seul, sans supprimer votre compte Yunary, depuis Profil, onglet Infos, section « Réseaux sociaux »."
          },
          {
            "type": "p",
            "text": "Si vous retirez Yunary depuis les réglages de votre compte Instagram, Meta nous transmet une demande de suppression que nous traitons automatiquement : les données issues de ce compte (statistiques des publications importées, compte connecté et jetons associés) sont supprimées. Vous pouvez suivre l'état de cette demande sur la page publique « Suppression des données » de Yunary, au chemin /suppression-donnees, dont l'adresse complète et le code de suivi vous sont communiqués au moment du retrait."
          }
        ]
      },
      {
        "heading": "9. Évolution de la présente politique",
        "blocks": [
          {
            "type": "p",
            "text": "La présente politique peut être mise à jour pour refléter l'évolution du service ou du cadre légal. La date de dernière mise à jour figure en tête de document ; les modifications substantielles vous seront notifiées par tout moyen approprié."
          }
        ]
      }
    ]
  }
};
