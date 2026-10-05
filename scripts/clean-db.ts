import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const demoUserIdsToDelete = [
  'demo_1788235310389',
  'demo_1788294005180',
  'demo_1788294030139',
  'demo_1788828899600',
  'demo_1788828959298',
  'demo_1788830458165',
  'demo_1788830676068',
  'demo_1788830768627',
  'demo_1788999827949',
  'demo_1789004418804',
  'demo_1789005198504',
  'demo_1789005208335',
  'demo_1789091043740',
  'S8TOjOJSkbcdPjdwQodx2QE76Ox2', // Oscar Test (test@email.com)
  'hBJY5IyJyucDXtqlVY0SHwTcK2F2', // Entreprise Démo (ferline@startbill.ca)
  'B0PZEz7MVUSdzRDkPaBW9WwkQ353', // oklolo@loooko.com (Nouvel Utilisateur / Mon Entreprise)
  'XQYvex8zeDRBZBxdS49K0AnEKl93', // start@sa.fr (Nouvel Utilisateur / Mon Entreprise)
  '4sjMqQCEUDaVsvxWDu7LLBidqNa2', // stioucom@dde.com
  'kIY00i3G4AOgbrgt7cNHqwuCuam1', // contact.startbill4@gmail.com
  'tayqHcESAHTKAnoWmZ8APLUNDXv1'  // contact.startbills@gmail.com
];

async function deleteDemoUsers() {
  console.log('--- PURGING DEMO / TEST USERS FROM FIRESTORE ---');
  let deletedCount = 0;
  for (const uid of demoUserIdsToDelete) {
    try {
      await deleteDoc(doc(db, 'users', uid));
      console.log(`Deleted demo user: ${uid}`);
      deletedCount++;
    } catch (err: any) {
      console.error(`Failed to delete user ${uid}:`, err.message);
    }
  }

  // Also check if any dummy documents exist in any other collection
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
    'test'
  ];

  for (const col of allCollections) {
    const snap = await getDocs(collection(db, col));
    if (!snap.empty) {
      console.log(`Cleaning ${snap.size} documents from collection [${col}]...`);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        deletedCount++;
      }
    }
  }

  console.log(`Total documents purged: ${deletedCount}`);
  
  // Verification count
  console.log('\n--- POST-PURGE VERIFICATION ---');
  const collectionsToCheck = [
    'users',
    'businesses',
    'subscriptions',
    'invoices',
    'clients',
    'expenses',
    'payments',
    'financial_obligations',
    'financial_health_snapshots',
    'financial_alerts',
    'alerts',
    'test',
    'learning_articles',
    'regionalSettings'
  ];

  for (const col of collectionsToCheck) {
    const snap = await getDocs(collection(db, col));
    console.log(`Table/Collection [${col}] -> ${snap.size} remaining rows/docs`);
    if (snap.size > 0 && col === 'users') {
      snap.forEach(d => {
        const data = d.data();
        console.log(`   - Verified real user: ${d.id} (${data.email || 'no-email'})`);
      });
    }
  }

  process.exit(0);
}

deleteDemoUsers().catch(err => {
  console.error('Purge error:', err);
  process.exit(1);
});
