/**
 * STARTBILL — ARCHITECTURE DES FEATURE FLAGS (GESTION DE VERSIONS & LANCEMENT)
 *
 * Source de vérité unique contrôlant l'ouverture des régions et fonctionnalités.
 *
 * MVP / V1 : Verrouillé strictement sur la région Canada (CAD, TPS/TVQ/TVH, ARC/RQ).
 * Les régions Afrique et Haïti sont conservées intactes dans le code source et
 * peuvent être réactivées à tout moment en passant leur flag à `true`.
 */

export type RegionId = 'canada' | 'afrique' | 'haiti';

export const FEATURE_FLAGS = {
  /**
   * Activation des régions par marché.
   * Pour activer une région lors d'une phase ultérieure (V2 / V3), passer à `true`.
   */
  REGIONS: {
    canada: true,
    afrique: false, // V2 : Afrique francophone (FCFA / OHADA / Mobile Money)
    haiti: false,   // V3 : Haïti (HTG / DGI / MonCash)
  } as Record<RegionId, boolean>,

  /**
   * Nombre de régions actuellement ouvertes au public.
   */
  get ENABLED_REGIONS_COUNT(): number {
    return (Object.keys(this.REGIONS) as RegionId[]).filter((r) => this.REGIONS[r]).length;
  },

  /**
   * Active l'étape de choix multi-régions et les sélecteurs inter-régions.
   * Automatiquement `false` tant qu'une seule région est activée (MVP V1).
   */
  get MULTI_REGION_ENABLED(): boolean {
    return this.ENABLED_REGIONS_COUNT > 1;
  },
};

export const DEFAULT_ACTIVE_REGION: RegionId = 'canada';

export const ENABLED_REGIONS: RegionId[] = (Object.keys(FEATURE_FLAGS.REGIONS) as RegionId[]).filter(
  (regionId) => FEATURE_FLAGS.REGIONS[regionId]
);

/**
 * Vérifie si une région donnée est actuellement activée par les feature flags.
 */
export function isRegionEnabled(regionId?: string | null): regionId is RegionId {
  if (!regionId) return false;
  return Boolean(FEATURE_FLAGS.REGIONS[regionId as RegionId]);
}

/**
 * Résout la région active autorisée :
 * - Retourne la région demandée si elle est activée par le feature flag.
 * - Sinon, bascule de manière sécurisée vers DEFAULT_ACTIVE_REGION ('canada').
 */
export function resolveActiveRegion(requestedRegion?: string | null): RegionId {
  if (isRegionEnabled(requestedRegion)) {
    return requestedRegion;
  }
  return DEFAULT_ACTIVE_REGION;
}
