import type { CustomFontSource, StripeElementStyle } from '@stripe/stripe-js';
import { getSupabase } from '../lib/supabase';
import { callEdge, type EdgeResult } from '../lib/edge';
import { fr } from '../i18n/fr';
import { paymentTools, type CreatePaymentData, type PaymentTarget } from './payment';

/** `create-payment` : appelé au clic sur « Payer », jamais à l'ouverture (le clic vaut acceptation des CGV). */
export function createPayment(body: Record<string, unknown>): Promise<EdgeResult<CreatePaymentData>> {
  return callEdge<CreatePaymentData>('create-payment', body, fr.paiement.form.errors.prepare);
}

/** Marge derrière le clic : le webhook d'un pack peut avoir écrit son droit juste avant la première lecture. */
const LOOKBACK_MS = 60_000;

/**
 * Les droits d'un achat sont-ils posés ? Le webhook les écrit une fois le paiement confirmé (`invoice.paid`,
 * `payment_intent.succeeded`), une à trois secondes après. Outils : un droit `subscription` actif pour chacun ;
 * pack : un droit `pack` actif de son outil, écrit depuis le clic.
 */
export async function rightsActive(target: PaymentTarget, userId: string, since: number, packToolId: string | null): Promise<boolean> {
  const supabase = getSupabase();
  const tools = paymentTools(target);
  let query = supabase.from('tool_entitlements').select('tool_id').eq('user_id', userId).eq('status', 'active');
  if (tools.length) {
    query = query.in('tool_id', tools).eq('source', 'subscription');
  } else {
    query = query.eq('source', 'pack').gte('updated_at', new Date(since - LOOKBACK_MS).toISOString()).limit(1);
    if (packToolId) query = query.eq('tool_id', packToolId);
  }
  const { data, error } = await query;
  if (error || !data) return false;
  return tools.length ? new Set(data.map(r => r.tool_id)).size >= tools.length : data.length > 0;
}

/** Sonde les droits chaque seconde, `maxMs` au plus. `true` dès qu'ils sont là ; `false` au bout du temps (jamais une erreur). */
export async function waitForRights(check: () => Promise<boolean>, maxMs: number, stepMs = 1000): Promise<boolean> {
  const end = Date.now() + maxMs;
  for (;;) {
    if (await check().catch(() => false)) return true;
    if (Date.now() + stepMs > end) return false;
    await new Promise(resolve => setTimeout(resolve, stepMs));
  }
}

/* ───────── Les champs Stripe, habillés aux jetons du DS ───────── */

/** Une couleur du DS lue dans la page, rendue en `rgb()` (Stripe ne lit pas les variables CSS, ni tous les formats). */
function resolveColor(anchor: HTMLElement, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  probe.style.display = 'none';
  anchor.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/**
 * Le style des trois champs carte (option `style` des Elements), LU dans les jetons du DS au montage : police
 * `--font-mono` (la maquette écrit les chiffres en mono), taille et couleur du champ `.ds-input` qui les
 * encadre, placeholder `--text-muted`, erreur `--destructive`, champ désactivé `--muted-foreground`. Rien en dur.
 */
export function readStripeStyle(anchor: HTMLElement): StripeElementStyle {
  const cs = getComputedStyle(anchor);
  const font = cs.getPropertyValue('--font-mono').trim() || cs.fontFamily;
  return {
    base: {
      fontFamily: font,
      fontSize: cs.fontSize,
      fontWeight: '400',
      color: cs.color,
      fontSmoothing: 'antialiased',
      '::placeholder': { color: resolveColor(anchor, 'var(--text-muted)') },
      ':disabled': { color: resolveColor(anchor, 'var(--muted-foreground)') },
    },
    invalid: { color: resolveColor(anchor, 'var(--foreground)'), iconColor: resolveColor(anchor, 'var(--destructive)') },
  };
}

/**
 * Les fichiers de la police mono du DS, pour l'iframe de Stripe (option `fonts` des Elements) : relus dans les
 * `@font-face` que la page a déjà chargés, en URL absolues. Sans eux, Stripe retombe sur la mono du système.
 * ⚠ L'iframe de Stripe charge ces fichiers depuis son domaine : l'app doit les servir avec
 * `Access-Control-Allow-Origin` (en-tête posé côté hébergeur).
 */
export function stripeFonts(): CustomFontSource[] {
  if (typeof document === 'undefined') return [];
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  if (!family) return [];
  const out: CustomFontSource[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const base = sheet.href ?? document.baseURI;
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const style = rule.style;
      if (style.getPropertyValue('font-family').replace(/['"]/g, '').trim() !== family) continue;
      const src = style.getPropertyValue('src').replace(/url\((['"]?)([^'")]+)\1\)/g, (_m, _q, url: string) => `url(${new URL(url, base).href})`);
      if (!/url\(https:/.test(src)) continue;
      out.push({
        family,
        src,
        weight: style.getPropertyValue('font-weight') || '400',
        style: (style.getPropertyValue('font-style') || 'normal') as CustomFontSource['style'],
        display: 'swap',
        unicodeRange: style.getPropertyValue('unicode-range') || undefined,
      });
    }
  }
  return out;
}
