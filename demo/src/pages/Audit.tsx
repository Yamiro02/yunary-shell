import type { JSX, ReactNode } from 'react';
import { Icon } from '@yunary/ds';
import { AuditBilan, fr, parseAccountAudit, type AccountAuditRow } from '@yunary/shell';
import { Section } from '../ui';

/* Les lignes `account_audits` de la vitrine, telles que l'Edge les écrit — le composant
   passe par le même parseur que l'app. */
const BASE: AccountAuditRow = {
  id: 'demo', user_id: 'demo', created_at: '2026-09-01T10:00:00Z', platform: 'instagram', handle: 'julien.crea', status: 'ok',
  social_account_id: null, error_detail: null, actions: null,
  synthese: "Ton compte a une base que beaucoup t'envieraient : une audience fidèle, qui commente et enregistre tes contenus. Mais tes vues plafonnent depuis trois mois : tes vidéos tournent dans ton cercle sans en sortir. Rien de cassé : c'est ce qui se corrige le plus vite, et c'est exactement le travail de Yunary.",
  prose: "Commençons par ce qui saute aux yeux : ton audience est fidèle. 74 commentaires par vidéo pour 12 400 abonnés, c'est plusieurs fois ce qu'on observe d'habitude à cette taille : les gens ne se contentent pas de regarder, ils te répondent. Tes 118 enregistrements moyens racontent la même chose : tes contenus servent, on les garde pour plus tard. C'est le signe d'un créateur qui a trouvé son public.\n\nMais tes vues plafonnent. 8 400 en moyenne, sous ta taille d'audience, et presque aucun mouvement depuis trois mois : tes vidéos tournent auprès des gens qui te connaissent déjà, sans sortir de ce cercle. En regardant tes vidéos une par une, la cause se voit : tes hooks posent le sujet au lieu de créer un manque, et tes structures livrent la promesse trop tard. Ton watch time de 11,2 secondes sur des vidéos de 40 le confirme : on décroche juste après l'ouverture.\n\nAutrement dit : le fond est là, la distribution ne suit pas. Ce n'est pas un problème de contenu, c'est un problème d'emballage. Et l'emballage, ça se travaille vite.",
  stats: {
    portee: { vues_moyennes: 8400, tendance: 'stable' },
    engagement: { likes_moyens: 610, commentaires_moyens: 74, partages_moyens: 26, saves_moyens: 118 },
    rythme: { publications: 214, frequence_hebdo: 2.1, plus_long_trou_jours: 10 },
    retention: { watch_time_moyen_sec: 11.2 },
    profil_meta: { followers: 12400, following: 890, bio: '' },
  },
  verdicts: {
    portee: { etat: 'sous_performe', ecart: "Tes vues restent sous ta taille d'audience" },
    engagement: { etat: 'surperforme', ecart: '74 commentaires par vidéo : rare à cette taille' },
    education: { etat: 'fort', ecart: '118 enregistrements : on garde tes contenus' },
    regularite: { etat: 'dans_la_moyenne', ecart: 'Bon rythme global, mais des trous de 10 jours' },
    profil: { etat: 'correct', ecart: 'Bio lisible, positionnement encore flou' },
  },
  points: {
    a_marche: [
      { nom: 'Une communauté qui répond', explication: "74 commentaires par vidéo : ton audience te parle, c'est rare et ça ne s'achète pas." },
      { nom: "Des contenus qu'on garde", explication: '118 enregistrements en moyenne : tes vidéos servent de référence, pas juste de divertissement.' },
      { nom: 'Un ton reconnaissable', explication: "Direct, concret, sans détour : on sait que c'est toi en trois secondes." },
    ],
    a_ameliorer: [
      { nom: 'Tes hooks', explication: 'Ils annoncent le sujet au lieu de créer un manque : les trois premières secondes ne retiennent pas les nouveaux venus.' },
      { nom: 'Tes structures', explication: "Le watch time décroche après l'ouverture : la promesse arrive trop tard dans la vidéo." },
      { nom: 'Ta bio', explication: "« Les entrepreneurs », c'est large : on ne sait pas pour qui tu crées, ni pourquoi te suivre toi." },
    ],
  },
  profil: {
    bio_texte: "Julien 🚀\nJ'aide les entrepreneurs à passer à l'action\n📈 Business · mindset · organique\n👇 Ma checklist gratuite pour te lancer\nlinktr.ee/julien.crea",
    bio_constats: [
      { dimension: 'clarte', etat: 'a_travailler', constat: "« Les entrepreneurs », c'est tout le monde et personne. Ta vraie audience, les salariés qui lancent un projet à côté, n'apparaît nulle part." },
      { dimension: 'structure', etat: 'solide', constat: 'Bonne base : lisible en trois lignes, un appel à l\'action clair en fin de bio. Rien à casser ici.' },
      { dimension: 'coherence_contenu', etat: 'a_travailler', constat: 'Ta bio promet du mindset, tes vidéos donnent des méthodes concrètes. C\'est ta force, annonce-la.' },
    ],
    photo_constat: 'Nette et lisible même en petit. Le fond chargé la dessert un peu, mais elle fait le travail.',
    photo_etat: 'solide',
  },
};

/* TikTok : ni enregistrements ni watch time (Instagram seulement), pas de constat photo → les tuiles disparaissent. */
const TIKTOK: AccountAuditRow = {
  ...BASE, platform: 'tiktok', handle: 'julien.crea',
  stats: { portee: { vues_moyennes: 23100, tendance: 'hausse' }, engagement: { likes_moyens: 1450, commentaires_moyens: 32, partages_moyens: 210 }, rythme: { publications: 96, frequence_hebdo: 4.3 }, profil_meta: { followers: 41000 } },
  verdicts: { portee: { etat: 'surperforme', ecart: 'Tes vues dépassent ta taille d\'audience' }, engagement: { etat: 'dans_la_moyenne' }, regularite: { etat: 'surperforme', ecart: 'Quatre vidéos par semaine, sans trou' } },
  profil: { bio_texte: 'Julien · business & organique', bio_constats: [{ dimension: 'clarte', etat: 'solide', constat: 'On sait pour qui tu crées dès la première ligne.' }], photo_constat: null },
  prose: null,
};

const NON_EVALUABLE: AccountAuditRow = { ...BASE, status: 'non_evaluable', synthese: null, prose: null, verdicts: null, points: null, profil: null, stats: { rythme: { publications: 2 } } };
/* Deux publications de moins : la jauge dit « Plus que 3 », pas « Plus qu'une ». */
const NON_EVALUABLE_ZERO: AccountAuditRow = { ...NON_EVALUABLE, stats: { rythme: { publications: 0 } } };
/* L'avatar bloqué par le CDN TikTok (`Cross-Origin-Resource-Policy`) : l'URL ne résout jamais,
   l'`<img>` tombe en erreur et la carte affiche l'initiale du handle. */
const AVATAR_BLOQUE: AccountAuditRow = {
  ...BASE, platform: 'tiktok', handle: 'marie.lance',
  stats: { ...(BASE.stats as Record<string, unknown>), profil_meta: { followers: 12400, following: 890, avatar_url: 'https://p16-sign.tiktokcdn-us.com/avatar-bloque.jpeg' } },
};
const ERROR: AccountAuditRow = { ...BASE, status: 'error', synthese: null, prose: null, verdicts: null, points: null, profil: null, stats: null };

export function AuditPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-space-7">
      <Section title="AuditBilan · bilan complet" note="Maître AuditBilan.dc.html (11/09) : pastilles de marque outlined, tous les titres de section en heading-sm. Instagram : toutes les métriques.">
        <Frame><AuditBilan audit={parseAccountAudit(BASE)} /></Frame>
      </Section>
      <Section title="TikTok · métriques partielles" note="Pas d'enregistrements ni de watch time, deux verdicts absents, pas de prose ni de constat photo : les tuiles correspondantes disparaissent.">
        <Frame><AuditBilan audit={parseAccountAudit(TIKTOK)} /></Frame>
      </Section>
      <Section title="Photo de profil bloquée" note="Avatars TikTok servis avec Cross-Origin-Resource-Policy : l'image échoue, `onError` bascule sur l'initiale du handle — jamais une carte sans photo.">
        <Frame><AuditBilan audit={parseAccountAudit(AVATAR_BLOQUE)} /></Frame>
      </Section>
      <Section title="Variante non évaluable" note="Artboard 09b : la jauge « 2 / 3 publications récentes · Plus qu'une ». Sans `nonEvaluableNote` — ce que voit Creator, qui n'a pas d'étape suivante.">
        <Frame><AuditBilan audit={parseAccountAudit(NON_EVALUABLE)} /></Frame>
      </Section>
      <Section title="Non évaluable · avec la note de l'hôte" note="Ce que le Hub rendra à son onboarding en passant `nonEvaluableNote` (chaîne `fr.audit.nonEvaluable.profilReady`). En dessous : aucune publication, la jauge dit « Plus que 3 ».">
        <div className="flex flex-col gap-space-5">
          <Frame>
            <AuditBilan
              audit={parseAccountAudit(NON_EVALUABLE)}
              nonEvaluableNote={<span className="inline-flex items-center gap-space-2 text-body-sm font-semibold text-pill-success-fg"><Icon name="check" strokeWidth={2.5} size="0.9375rem" />{fr.audit.nonEvaluable.profilReady}</span>}
            />
          </Frame>
          <Frame><AuditBilan audit={parseAccountAudit(NON_EVALUABLE_ZERO)} /></Frame>
        </div>
      </Section>
      <Section title="Erreur" note="AuditStateCard = la StateCard du DS depuis 0.1.9 : pastille héros outlined carrée, ton danger, role alert.">
        <Frame><AuditBilan audit={parseAccountAudit(ERROR)} /></Frame>
      </Section>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }): JSX.Element {
  return <div className="rounded-xl border border-border bg-background p-space-6">{children}</div>;
}
