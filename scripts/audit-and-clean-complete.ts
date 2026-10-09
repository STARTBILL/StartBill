import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

interface CollectionReport {
  collectionName: string;
  totalDocuments: number;
  fictiveDocumentsDeleted: number;
  remainingDocuments: number;
  documentsSummary: string[];
}

async function runCompleteCleanAndAudit() {
  console.log('================================================================');
  console.log('AUDIT & NETTOYAGE COMPLET DE LA BASE DE DONNÉES FIRESTORE');
  console.log('Database ID:', firebaseConfig.firestoreDatabaseId);
  console.log('================================================================\n');

  const allCollections = [
    'invoices',
    'clients',
    'expenses',
    'businesses',
    'subscriptions',
    'payments',
    'financial_obligations',
    'financial_health_snapshots',
    'financial_alerts',
    'alerts',
    'test',
    'users',
    'learning_articles',
    'regionalSettings',
    'system_config'
  ];

  const reports: Record<string, CollectionReport> = {};

  // 1. Process Transactional Collections (Must be 0 fictive items)
  const transactionalCollections = [
    'invoices',
    'clients',
    'expenses',
    'businesses',
    'subscriptions',
    'payments',
    'financial_obligations',
    'financial_health_snapshots',
    'financial_alerts',
    'alerts',
    'test'
  ];

  for (const colName of transactionalCollections) {
    try {
      const snap = await getDocs(collection(db, colName));
      const initialCount = snap.size;
      let deletedCount = 0;

      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        deletedCount++;
      }

      // Verify after clean
      const postSnap = await getDocs(collection(db, colName));
      reports[colName] = {
        collectionName: colName,
        totalDocuments: initialCount,
        fictiveDocumentsDeleted: deletedCount,
        remainingDocuments: postSnap.size,
        documentsSummary: []
      };
    } catch (e: any) {
      reports[colName] = {
        collectionName: colName,
        totalDocuments: 0,
        fictiveDocumentsDeleted: 0,
        remainingDocuments: 0,
        documentsSummary: [`Accès restreint par les règles de sécurité Firestore (${e.code})`]
      };
    }
  }

  // 2. Process Users Collection (Identify demo/fake accounts vs real owners)
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    let deletedUsers = 0;
    const userSummaries: string[] = [];

    for (const d of usersSnap.docs) {
      const data = d.data();
      const email = (data.email || '').toLowerCase();
      const id = d.id;

      const isDemoId = id.startsWith('demo_');
      const isTestEmail = email.includes('example.com') || email.includes('test.com') || email.includes('user.facebook') || email.includes('user.google@startbill.com');

      if (isDemoId || isTestEmail) {
        await deleteDoc(d.ref);
        deletedUsers++;
        console.log(`Suppression du compte fictif : ${id} (${email})`);
      } else {
        userSummaries.push(`ID: ${id} | Email: ${email} | Rôle: ${data.role || 'user'} | Plan: ${data.plan || 'free'}`);
      }
    }

    const postUsersSnap = await getDocs(collection(db, 'users'));
    reports['users'] = {
      collectionName: 'users',
      totalDocuments: usersSnap.size,
      fictiveDocumentsDeleted: deletedUsers,
      remainingDocuments: postUsersSnap.size,
      documentsSummary: userSummaries
    };
  } catch (e: any) {
    reports['users'] = {
      collectionName: 'users',
      totalDocuments: 0,
      fictiveDocumentsDeleted: 0,
      remainingDocuments: 0,
      documentsSummary: [`Accès restreint (${e.code})`]
    };
  }

  // 3. Process System Collections (Articles & Regional Settings)
  for (const sysCol of ['learning_articles', 'regionalSettings', 'system_config']) {
    try {
      const snap = await getDocs(collection(db, sysCol));
      const summaries: string[] = [];
      snap.forEach(d => summaries.push(d.id));
      reports[sysCol] = {
        collectionName: sysCol,
        totalDocuments: snap.size,
        fictiveDocumentsDeleted: 0,
        remainingDocuments: snap.size,
        documentsSummary: summaries
      };
    } catch (e: any) {
      reports[sysCol] = {
        collectionName: sysCol,
        totalDocuments: 0,
        fictiveDocumentsDeleted: 0,
        remainingDocuments: 0,
        documentsSummary: [`Accès restreint (${e.code})`]
      };
    }
  }

  // 4. Print Summary Table
  console.log('\n--- RAPPORT FINAL D\'INVENTAIRE & DE VÉRIFICATION POST-SUPPRESSION ---\n');
  console.table(
    Object.values(reports).map(r => ({
      'Collection / Table': r.collectionName,
      'Lignes Supprimées': r.fictiveDocumentsDeleted,
      'Lignes Restantes': r.remainingDocuments,
      'Statut Attendu': transactionalCollections.includes(r.collectionName) ? 'VIDE (0)' : 'SYSTÈME / RÉEL'
    }))
  );

  console.log('\nDétail des comptes utilisateurs réels conservés (Non fictifs) :');
  reports['users'].documentsSummary.forEach(u => console.log('  •', u));

  console.log('\nDétail des configurations système conservées :');
  console.log('  • Articles d\'apprentissage :', reports['learning_articles'].documentsSummary.join(', '));
  console.log('  • Paramètres régionaux :', reports['regionalSettings'].documentsSummary.join(', '));

  process.exit(0);
}

runCompleteCleanAndAudit().catch(err => {
  console.error('Erreur fatale lors du nettoyage:', err);
  process.exit(1);
});
