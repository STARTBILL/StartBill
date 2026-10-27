import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = 'contact.startbill@gmail.com';
const ADMIN_DEFAULT_PASSWORD = 'StartBillAdmin2026!';

async function configureDomainInDatabase() {
  console.log('--- CONFIGURATION DU DOMAINE STARTBILL.CA DANS LA BASE DE DONNÉES FIRESTORE ---');

  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Fichier firebase-applet-config.json introuvable`);
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(firebaseConfig, `domain-configurator-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  // Authenticate as Admin
  try {
    const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD);
    console.log(`Authentifié avec succès en tant qu'administrateur (${cred.user.email}, UID: ${cred.user.uid})`);
  } catch (err: any) {
    console.warn(`Avertissement auth admin : ${err.message}. Tentative d'écriture directe...`);
  }

  const now = new Date().toISOString();

  // 1. Configure /system_config/domain
  const domainConfigData = {
    id: 'domain',
    primaryDomain: 'startbill.ca',
    canonicalUrl: 'https://startbill.ca',
    hostingerStatus: 'configured',
    dnsProvider: 'hostinger',
    allowedOrigins: [
      'https://startbill.ca',
      'https://www.startbill.ca',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    authDomain: firebaseConfig.authDomain || 'startbill-dev.firebaseapp.com',
    firebaseAuthAuthorizedDomains: [
      'startbill.ca',
      'www.startbill.ca',
      'startbill-dev.firebaseapp.com',
      'localhost',
    ],
    supportEmail: 'contact.startbill@gmail.com',
    updatedAt: now,
  };

  await setDoc(doc(db, 'system_config', 'domain'), domainConfigData, { merge: true });
  console.log('✅ Configuration enregistrée dans Firestore: /system_config/domain');

  // 2. Configure /system_config/hostinger
  const hostingerConfigData = {
    id: 'hostinger',
    domain: 'startbill.ca',
    status: 'configured',
    platform: 'Hostinger DNS & Web',
    dnsRecords: {
      aRecord: '@ -> Hostinger / Applet IP',
      cnameRecord: 'www -> startbill.ca',
    },
    ssl: {
      enabled: true,
      provider: 'Hostinger Let\'s Encrypt / Custom SSL',
      status: 'active',
    },
    lastVerifiedAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'system_config', 'hostinger'), hostingerConfigData, { merge: true });
  console.log('✅ Configuration enregistrée dans Firestore: /system_config/hostinger');

  // 3. Update /regionalSettings/canada with official domain & website
  await setDoc(
    doc(db, 'regionalSettings', 'canada'),
    {
      domain: 'startbill.ca',
      appUrl: 'https://startbill.ca',
      website: 'https://startbill.ca',
      hostingerConfigured: true,
      updatedAt: now,
    },
    { merge: true }
  );
  console.log('✅ Configuration régionale Canada mise à jour dans Firestore: /regionalSettings/canada');

  // 4. Verify readings
  const verifyDomainDoc = await getDoc(doc(db, 'system_config', 'domain'));
  const verifyCanadaDoc = await getDoc(doc(db, 'regionalSettings', 'canada'));

  console.log('\n--- VÉRIFICATION DES DONNÉES FIRESTORE ---');
  console.log('system_config/domain:', JSON.stringify(verifyDomainDoc.data(), null, 2));
  console.log('regionalSettings/canada (domain fields):', {
    domain: verifyCanadaDoc.data()?.domain,
    appUrl: verifyCanadaDoc.data()?.appUrl,
    website: verifyCanadaDoc.data()?.website,
    hostingerConfigured: verifyCanadaDoc.data()?.hostingerConfigured,
  });

  console.log('\n--- CONFIGURATION BASE DE DONNÉES TERMINÉE AVEC SUCCÈS ---');
}

configureDomainInDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erreur configuration BDD :', err);
    process.exit(1);
  });
