import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { fr } from '../i18n/fr';
import { callEdge } from '../lib/edge';
import { messageForCode } from '../lib/errors';

/** Une ligne de facture (colonne « Détail » du hub) : « Yunary Audit », « … · prorata », « … · avoir » (négatif). */
export interface InvoiceLine {
  libelle: string;
  montant: number;
  du: string;
  au: string;
}

/** Une facture (`list-invoices`, les 24 dernières, brouillons exclus). Montants en centimes. */
export interface Invoice {
  date: string;
  numero: string | null;
  montant: number;
  statut: 'paid' | 'open' | 'void' | 'uncollectible' | string;
  pdfUrl: string | null;
  hostedUrl: string | null;
  lignes: InvoiceLine[];
}

/** `list-invoices` → `data`, aux noms exacts du contrat (§ 8 du back). */
export interface InvoicesInfo {
  factures: Invoice[];
  prochainPrelevement: { date: string; montant: number } | null;
  /** `expiration` au format MM/AAAA. */
  moyenDePaiement: { marque: string; last4: string; expiration: string } | null;
  adresse: { nom: string | null; ligne1: string | null; ligne2: string | null; codePostal: string | null; ville: string | null; pays: string | null } | null;
}

export const invoicesKey = (userId: string | undefined) => ['invoices', userId] as const;

const EMPTY: InvoicesInfo = { factures: [], prochainPrelevement: null, moyenDePaiement: null, adresse: null };

/** Les factures de la page Facturation du hub. Pas encore client Stripe (`no_customer`) = aucune facture, pas une erreur. */
export function useInvoices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: invoicesKey(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<InvoicesInfo> => {
      const res = await callEdge<InvoicesInfo>('list-invoices', {}, fr.errors.generic);
      if (res.ok) return res.data;
      if (res.code === 'no_customer') return EMPTY;
      throw new Error(messageForCode(res.code, fr.errors.generic));
    },
  });
}
