import { getStoredToken } from './api';

export interface PendingMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timestamp: number;
  description: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  lastError: string | null;
}

const QUEUE_STORAGE_KEY = 'finanflow_offline_pending_mutations';
const SNAPSHOT_PREFIX = 'finanflow_snapshot_';

type Listener = (status: SyncStatus) => void;

class OfflineSyncManager {
  private queue: PendingMutation[] = [];
  private isSyncing = false;
  private lastSyncTime: number | null = null;
  private lastError: string | null = null;
  private listeners: Set<Listener> = new Set();
  private onSyncCompleteCallbacks: Set<() => void> = new Set();

  constructor() {
    this.loadQueue();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[OfflineSync] Conexão com a internet restabelecida!');
        this.notify();
        this.syncPendingMutations();
      });

      window.addEventListener('offline', () => {
        console.log('[OfflineSync] Conexão com a internet perdida.');
        this.notify();
      });

      // Verificação periódica suave
      setInterval(() => {
        if (navigator.onLine && this.queue.length > 0 && !this.isSyncing) {
          this.syncPendingMutations();
        }
      }, 15000);
    }
  }

  // --- Carregamento e Persistência da Fila Local ---
  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[OfflineSync] Erro ao carregar fila offline:', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineSync] Erro ao salvar fila offline:', e);
    }
    this.notify();
  }

  // --- Gerenciamento de Snapshots de Dados Financeiros ---
  saveSnapshot(endpoint: string, data: any) {
    try {
      localStorage.setItem(`${SNAPSHOT_PREFIX}${endpoint}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      // localStorage pode estar cheio, silenciosamente ignora
    }
  }

  getSnapshot<T>(endpoint: string): T | null {
    try {
      const stored = localStorage.getItem(`${SNAPSHOT_PREFIX}${endpoint}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data as T;
      }
    } catch (e) {
      console.warn('[OfflineSync] Erro ao ler snapshot offline:', e);
    }
    return null;
  }

  clearAllSnapshots() {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith(SNAPSHOT_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // ignore
    }
  }

  // --- Enfileiramento de Alteração Offline ---
  enqueue(mutation: Omit<PendingMutation, 'id' | 'timestamp'>): PendingMutation {
    const item: PendingMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now()
    };

    this.queue.push(item);
    this.saveQueue();
    console.log(`[OfflineSync] Alteração salva localmente no dispositivo (${item.description}). Fila: ${this.queue.length}`);
    return item;
  }

  getQueue(): PendingMutation[] {
    return [...this.queue];
  }

  // --- Sincronização Automática com o Servidor ao Reconectar ---
  async syncPendingMutations(): Promise<boolean> {
    if (this.isSyncing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
    if (this.queue.length === 0) return true;

    const token = getStoredToken();
    if (!token) {
      console.warn('[OfflineSync] Sem token ativo, adiando sincronização');
      return false;
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    console.log(`[OfflineSync] Iniciando upload de ${this.queue.length} alteração(ões) pendentes para o servidor...`);

    const remaining: PendingMutation[] = [];
    let syncedCount = 0;

    for (const item of this.queue) {
      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };

        let body: string | undefined;
        if (item.body) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(item.body);
        }

        const res = await fetch(item.endpoint, {
          method: item.method,
          headers,
          body
        });

        if (res.ok) {
          syncedCount++;
          console.log(`[OfflineSync] ✅ Sincronizado com sucesso: ${item.description}`);
        } else if (res.status >= 400 && res.status < 500) {
          // Erro de cliente (ex: item já removido ou validação) -> descarta da fila para não travar
          console.warn(`[OfflineSync] Descartando mutação inválida (${res.status}): ${item.description}`);
        } else {
          // Erro de servidor (5xx) -> mantém na fila para tentar novamente
          remaining.push(item);
        }
      } catch (err: any) {
        console.warn(`[OfflineSync] Falha na rede ao sincronizar ${item.description}:`, err);
        remaining.push(item);
        // Interrompe o loop se não houver conectividade
        break;
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.isSyncing = false;
    this.lastSyncTime = Date.now();
    this.notify();

    if (syncedCount > 0) {
      // Dispara callback para recarregar todos os dados do servidor
      this.onSyncCompleteCallbacks.forEach((cb) => cb());
    }

    return this.queue.length === 0;
  }

  // --- Inscrições de Status e Notificações ---
  getStatus(): SyncStatus {
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.length,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  onSyncComplete(cb: () => void): () => void {
    this.onSyncCompleteCallbacks.add(cb);
    return () => this.onSyncCompleteCallbacks.delete(cb);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        console.error('[OfflineSync] Erro no listener:', e);
      }
    });
  }
}

export const offlineSync = new OfflineSyncManager();
