import type { JSX, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Logo } from '@yunary/ds';
import { fr } from '../i18n/fr';
import type { ToolId } from '../config';
import { TOOLS, toolUrl, type ToolDef } from '../layout/tools';
import { ToolName } from '../layout/ToolName';
import { useProfile } from '../account/useProfile';

export interface OutilsViewProps {
  /** L'outil courant : sa carte navigue en interne vers `homeHref` au lieu de recharger son sous-domaine. */
  tool: ToolId;
  /** L'accueil de l'outil courant, en route locale (`/videos` pour Creator). Sans lui, la carte garde son lien absolu. */
  homeHref?: string;
  prenom: string | null;
}

/**
 * « Mes outils » (C1) — remontée du Hub le 11/09/2026 (décision Julien) : la page s'ouvre DANS chaque
 * outil, sur sa route locale `/outils`, sans changer de sous-domaine ni de menu. Les cartes viennent
 * du registre `TOOLS` (Creator `live`, Metrics `soon`) ; le Hub n'a pas de carte — « Mes outils » EST
 * son accueil ; le solde de crédits vit dans la sidebar, jamais ici.
 * Inventaire de l'artboard C1 (08/09/2026) : en-tête « Salut {prénom} » + chapô muted (gap 8) ;
 * gap 20 (→ `space-5`) ; carte standard au pas `space-5`, monogramme 2,25 rem + nom en `heading-sm`
 * avec le mot accentué, description `body-sm` secondary, « Ouvrir » en primaire `sm` ; la carte
 * « Bientôt » n'est pas interactive et rend à 80 % d'opacité.
 * Pleine largeur : la grille est en auto-fill sur une largeur minimale de carte, le rôle `dialog` du
 * DS (27,5 rem, la carte de l'artboard C1 fait 450 px) — `grid-cards-dialog` (DS 0.1.3) : les cartes
 * gardent leur taille, il y en a plus par ligne sur grand écran. Rythme vertical des pages de la
 * coque (proportions de la v1) : `space-5` entre les blocs, `space-4` sous 64 rem.
 */
export function OutilsView({ tool, homeHref, prenom }: OutilsViewProps): JSX.Element {
  const t = fr.outils;
  const tools = TOOLS.filter(def => def.id !== 'hub');
  return (
    <div className="flex flex-col gap-space-4 lg:gap-space-5">
      <div className="flex flex-col gap-space-2">
        <h1 className="text-heading-xl">{t.hello(prenom)}</h1>
        <p className="text-body-lg text-text-muted">{t.lead}</p>
      </div>
      <div className="grid grid-cards-dialog gap-space-5">
        {tools.map(def =>
          def.status === 'live' ? (
            <LiveCard key={def.id} tool={def} homeHref={def.id === tool ? homeHref : undefined} />
          ) : (
            <SoonCard key={def.id} tool={def} />
          ),
        )}
      </div>
    </div>
  );
}

export interface OutilsPageProps {
  tool: ToolId;
  homeHref?: string;
}

/** « Mes outils », câblée : le prénom vient du profil. Montée par chaque app sur `/outils` (le Hub sur `/`). */
export function OutilsPage({ tool, homeHref }: OutilsPageProps): JSX.Element {
  const profile = useProfile();
  return <OutilsView tool={tool} homeHref={homeHref} prenom={profile.data?.prenom ?? null} />;
}

/**
 * La carte d'un outil ouvert. Avec `homeHref` (l'outil courant), « Ouvrir » reste une vraie `<a href>`
 * — clic-milieu, « ouvrir dans un onglet » et lecteur d'écran intacts — dont le clic simple est
 * intercepté pour naviguer côté client : pas de rechargement vers le sous-domaine où l'on est déjà.
 * Un clic modifié ou un bouton non gauche passe au navigateur. Le `as` de `Button` n'accepte que des
 * éléments intrinsèques (BACKLOG du DS), d'où le détour plutôt qu'un `Link` du routeur.
 */
function LiveCard({ tool, homeHref }: { tool: ToolDef; homeHref?: string }): JSX.Element {
  const navigate = useNavigate();
  const href = homeHref ?? toolUrl(tool.id);
  const onClick = homeHref
    ? (e: MouseEvent<HTMLElement>) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(homeHref);
      }
    : undefined;
  return (
    <Card variant="interactive" gap={5}>
      <div className="flex items-center gap-space-3">
        <Logo variant="monogram" height="2.25rem" />
        <h3 className="text-heading-sm"><ToolName tool={tool} /></h3>
      </div>
      <p className="text-body-sm leading-normal text-text-secondary">{tool.description}</p>
      <div className="flex">
        <Button variant="primary" size="sm" as="a" href={href} onClick={onClick}>{fr.outils.open}</Button>
      </div>
    </Card>
  );
}

function SoonCard({ tool }: { tool: ToolDef }): JSX.Element {
  return (
    <Card gap={5} className="opacity-80">
      <div className="flex items-center justify-between gap-space-3">
        <div className="flex items-center gap-space-3">
          <Logo variant="monogram" height="2.25rem" />
          <h3 className="text-heading-sm"><ToolName tool={tool} /></h3>
        </div>
        <Badge tone="neutral">{fr.outils.soon}</Badge>
      </div>
      <p className="text-body-sm leading-normal text-text-secondary">{tool.description}</p>
    </Card>
  );
}
