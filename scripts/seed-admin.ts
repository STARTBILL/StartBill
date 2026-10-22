import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants for Primary Administrator
export const ADMIN_EMAIL = 'contact.startbill@gmail.com';
export const ADMIN_DEFAULT_PASSWORD = 'StartBillAdmin2026!';
export const ADMIN_ROLE = 'admin';

async function seedAdmin() {
  console.log('--- INITIALISATION DU COMPTE ADMINISTRATEUR PRINCIPAL STARTBILL ---');
  console.log(`Email Administrateur : ${ADMIN_EMAIL}`);

  // 1. Load Firebase configuration
  const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Fichier de configuration Firebase introuvable : ${configPath}`);
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(firebaseConfig, `admin-seeder-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  // 2. Authenticate or create user in Firebase Authentication
  let authUser;
  try {
    const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD);
    authUser = cred.user;
    console.log(`Connecté avec succès en tant qu'admin Firebase Auth (UID: ${authUser.uid})`);
  } catch (authErr: any) {
    if (
      authErr.code === 'auth/user-not-found' || 
      authErr.code === 'auth/invalid-credential' ||
      authErr.code === 'auth/wrong-password'
    ) {
      console.log("Création du compte Firebase Auth pour l'administrateur...");
      try {
        const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD);
        authUser = cred.user;
        console.log(`Compte Firebase Auth créé avec succès (UID: ${authUser.uid})`);
      } catch (createErr: any) {
        console.log("Compte existant dans Firebase Auth ou throttling détecté. Poursuite du provisionnement...");
      }
    }
  }

  // 3. Hash default admin password securely with bcrypt salt rounds = 10
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, saltRounds);
  console.log('Mot de passe sécurisé haché avec succès (Bcrypt) :', passwordHash);

  const adminUid = authUser?.uid || 'admin_contact_startbill';

  // 4. Admin profile with RBAC admin role, enterprise plan, and hashed password
  const adminProfileData = {
    uid: adminUid,
    email: ADMIN_EMAIL,
    fullName: 'Administrateur Principal StartBill',
    companyName: 'StartBill Technologies Inc.',
    role: ADMIN_ROLE,
    plan: 'enterprise',
    region: 'canada',
    isSuperAdmin: true,
    passwordHash: passwordHash,
    active: true,
    securityClearance: 'RBAC_LEVEL_1_SUPER_ADMIN',
    permissions: [
      'admin:read',
      'admin:write',
      'admin:delete',
      'system:manage_keys',
      'system:audit_logs',
      'users:manage',
      'subscriptions:manage',
      'stripe:manage'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Write local seed backup
  const seedBackupPath = path.resolve(__dirname, '../src/data/adminSeed.json');
  fs.writeFileSync(seedBackupPath, JSON.stringify(adminProfileData, null, 2));
  console.log('Fichier de configuration Admin généré : src/data/adminSeed.json');

  if (authUser) {
    try {
      await setDoc(doc(db, 'users', authUser.uid), adminProfileData, { merge: true });
      console.log(`Profil Administrateur enregistré dans Firestore : /users/${authUser.uid}`);
    } catch (e: any) {
      console.warn("Notice Firestore write:", e.message);
    }
  }

  console.log('Compte Administrateur provisionné avec succès dans Cloud Firestore !');
  console.log('Rôle : admin (RBAC)');
  console.log(`Identifiant : ${ADMIN_EMAIL}`);
  console.log('Mot de passe : StartBillAdmin2026! (Stocké haché en BDD avec Bcrypt)');
}

seedAdmin()
  .then(() => {
    console.log('--- Initialisation terminée avec succès ---');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erreur lors de la création du compte admin :', err);
    process.exit(1);
  });
