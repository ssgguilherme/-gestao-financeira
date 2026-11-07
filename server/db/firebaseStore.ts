import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import type { DatabaseSchema } from './store';

let firestoreDb: any = null;
let isInitialized = false;

function getFirestoreInstance() {
  if (isInitialized) return firestoreDb;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️ [Firebase] firebase-applet-config.json não encontrado.');
      return null;
    }

    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    const app = !getApps().length ? initializeApp(config) : getApp();
    firestoreDb = getFirestore(app, config.firestoreDatabaseId);
    isInitialized = true;
    console.log('✅ [Firebase] Conexão com Firestore inicializada com sucesso no servidor.');
    return firestoreDb;
  } catch (err) {
    console.error('❌ [Firebase] Erro ao inicializar Firestore no servidor:', err);
    return null;
  }
}

export async function fetchStoreFromCloud(): Promise<DatabaseSchema | null> {
  const db = getFirestoreInstance();
  if (!db) return null;

  try {
    const docRef = doc(db, 'system', 'finanflow_store');
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const cloudData = snapshot.data();
      if (cloudData && typeof cloudData.payload === 'string') {
        const parsed = JSON.parse(cloudData.payload);
        if (parsed && Array.isArray(parsed.users)) {
          console.log(`☁️ [Firebase] Carregados ${parsed.users.length} usuários persistentes do Firestore!`);
          return parsed as DatabaseSchema;
        }
      }
    } else {
      console.log('ℹ️ [Firebase] Documento system/finanflow_store ainda não existe na nuvem. Será criado no próximo salvamento.');
    }
  } catch (err) {
    console.error('⚠️ [Firebase] Falha ao buscar dados do Firestore:', err);
  }
  return null;
}

let saveTimeout: NodeJS.Timeout | null = null;
let pendingData: DatabaseSchema | null = null;

export function scheduleCloudSave(data: DatabaseSchema): void {
  const db = getFirestoreInstance();
  if (!db) return;

  pendingData = data;

  // Debounce de 1.5s para economizar escritas e garantir integridade
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    if (!pendingData) return;
    const toSave = pendingData;
    pendingData = null;

    try {
      const docRef = doc(db, 'system', 'finanflow_store');
      const serialized = JSON.stringify(toSave);
      await setDoc(docRef, {
        payload: serialized,
        updatedAt: new Date().toISOString(),
        usersCount: toSave.users.length,
        transactionsCount: toSave.transactions.length
      });
      console.log(`☁️ [Firebase] ${toSave.users.length} usuários e ${toSave.transactions.length} transações persistidos no Firestore!`);
    } catch (err) {
      console.error('❌ [Firebase] Erro ao salvar dados no Firestore:', err);
    }
  }, 1500);
}
