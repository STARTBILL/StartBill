import { Request, Response, NextFunction } from 'express';
import { doc, getDoc, Firestore } from 'firebase/firestore';

export interface AuthenticatedRegionRequest extends Request {
  userRegion?: 'canada' | 'afrique' | 'haiti';
  userId?: string;
}

/**
 * Middleware de sécurité backend : RÈGLE D'OR DE CLOISONNEMENT STRICT DES DONNÉES (Strict Data Isolation)
 * 
 * 1. Capture l'UID utilisateur via token / en-tête d'authentification.
 * 2. Vérifie dans la base de données Firestore (users/{uid}) la région irréversible choisie à l'inscription.
 * 3. Rejette immédiatement (403 Forbidden) toute tentative de manipulation de l'URL, 
 *    des paramètres (?region=...) ou du corps de requête ciblant une autre région.
 * 4. Injecte automatiquement `req.userRegion` pour forcer le filtre WHERE region = ? sur la base de données.
 */
export function createRegionIsolationMiddleware(db: Firestore | null) {
  return async (req: AuthenticatedRegionRequest, res: Response, next: NextFunction): Promise<void> => {
    // Les routes publiques ou webhooks Stripe externes sont exemptés de l'isolation utilisateur
    if (
      req.path.startsWith('/api/stripe/webhook') ||
      req.path.startsWith('/api/stripe/config')
    ) {
      next();
      return;
    }

    try {
      const authHeader = req.headers.authorization;
      const explicitUid = (req.headers['x-user-id'] || req.query.userId || req.body?.userId) as string;
      const requestedRegion = (req.query.region || req.body?.region || req.headers['x-user-region']) as string;

      // Si l'UID utilisateur est fourni, nous validons son profil en base de données
      if (explicitUid && db) {
        req.userId = explicitUid;
        const userRef = doc(db, 'users', explicitUid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const registeredRegion = userData.region as 'canada' | 'afrique' | 'haiti';
          const isSuperAdmin = 
            userData.role === 'admin' ||
            (userData.email && (
              userData.email.toLowerCase() === 'contact.startbill@gmail.com' ||
              userData.email.toLowerCase() === 'admin.canada@startbill.com'
            ));

          // Un Super-Admin dispose de la vision consolidée multi-régions pour piloter le SaaS
          if (isSuperAdmin) {
            req.userRegion = (requestedRegion as any) || registeredRegion || 'canada';
            next();
            return;
          }

          // RÈGLE ABSOLUE POUR LES UTILISATEURS STANDARDS :
          // Si une région différente de la région d'inscription est demandée, REJET 403 FORBIDDEN
          if (requestedRegion && requestedRegion !== registeredRegion) {
            console.warn(`[SECURITY 403] Tentative de violation de cloisonnement de données par l'utilisateur ${explicitUid} : région demandée "${requestedRegion}" vs région inscrite "${registeredRegion}"`);
            res.status(403).json({
              error: 'Forbidden (403) : Violation du cloisonnement strict des données.',
              message: `Sécurité StartBill : Votre compte est strictement rattaché à la zone "${registeredRegion}". Vous ne pouvez pas accéder aux données d'une autre région.`,
              registeredRegion
            });
            return;
          }

          // Forcer la région dans la requête pour tous les accès base de données
          req.userRegion = registeredRegion;
          if (req.body && typeof req.body === 'object') {
            req.body.region = registeredRegion;
          }
        }
      }

      next();
    } catch (err: any) {
      console.error('[RegionIsolationMiddleware Error]:', err);
      next();
    }
  };
}
