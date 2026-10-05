import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const collectionsToInspect = [
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
  'learning_articles',
  'alerts',
  'regionalSettings',
  'test'
];

async function main() {
  console.log('--- FIRESTORE INVENTORY ---');
  for (const colName of collectionsToInspect) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Collection [${colName}]: ${snap.size} documents`);
      if (snap.size > 0) {
        snap.forEach(docSnap => {
          console.log(`  - doc id: ${docSnap.id}, data:`, JSON.stringify(docSnap.data()).slice(0, 150));
        });
      }
    } catch (e: any) {
      console.error(`Error querying [${colName}]:`, e.message);
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
