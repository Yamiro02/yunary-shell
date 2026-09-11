import { cloneElement, isValidElement, type ReactNode } from 'react';

/**
 * Le glyphe des pastilles `carte` de la coque : **18 px** (1,125 rem), comme le `<svg 18>` des
 * artboards 06-09 et AuditBilan (12/09/2026). Le repli de la pastille est 1,25 rem ; le DS
 * dimensionne un glyphe par la prop `size` de l'`Icon`, qui écrit `--ds-icon-size` INLINE sur le
 * svg — la propriété est enregistrée `inherits:false`, une valeur posée sur la pastille serait
 * inerte. D'où ce geste : la carte pose `size` sur l'icône qu'elle reçoit, sauf si l'appelant
 * l'a déjà fixée (la surcharge optique au site d'appel reste possible).
 */
export const CARD_GLYPH_SIZE = '1.125rem';

export function withGlyphSize(icon: ReactNode, size: string = CARD_GLYPH_SIZE): ReactNode {
  if (!isValidElement<{ size?: string }>(icon) || icon.props.size !== undefined) return icon;
  return cloneElement(icon, { size });
}
