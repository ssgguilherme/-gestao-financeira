// FinanFlow PWA Service Worker - Cache Local Offline & Sincronização
const STATIC_CACHE = 'finanflow-static-v3.2.0';
const API_CACHE = 'finanflow-api-data-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Instalação: Pré-cache dos ativos essenciais do app
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear alguns ativos:', err);
      });
    })
  );
});

// Ativação: Limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Purgando cache antigo:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições de rede (GET)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignorar extensões de navegador
  if (url.protocol.startsWith('chrome-extension')) return;

  // 1. REQUISIÇÕES DA API (/api/*): Cache de Dados Financeiros
  if (url.pathname.startsWith('/api/')) {
    // Não cacheia tentativas de login/registro ou download de backup
    if (
      url.pathname.startsWith('/api/auth/login') ||
      url.pathname.startsWith('/api/auth/register') ||
      url.pathname.includes('/backup')
    ) {
      return;
    }

    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // Se obteve resposta com sucesso, atualiza o cache local de dados
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Quando estiver sem conexão (offline), busca a última resposta válida do cache
          const cachedResponse = await caches.match(req);
          if (cachedResponse) {
            console.log('[SW] Servindo dados financeiros do cache offline para:', url.pathname);
            return cachedResponse;
          }

          return new Response(
            JSON.stringify({
              error: 'Você está offline.',
              offline: true,
              message: 'Não foi possível conectar ao servidor. Verifique sua conexão com o Wi-Fi ou dados móveis.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 2. ATIVOS ESTÁTICOS & SHELL DO APLICATIVO (HTML, JS, CSS, Fontes, Ícones)
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Tenta encontrar o arquivo específico no cache
        const cached = await caches.match(req);
        if (cached) return cached;

        // Se for navegação de página (ex: recarregar sem internet), entrega o index.html cacheado
        if (req.mode === 'navigate') {
          const indexCached = (await caches.match('/index.html')) || (await caches.match('/'));
          if (indexCached) return indexCached;
        }

        return new Response('Sem conexão à internet', { status: 503, statusText: 'Offline' });
      })
  );
});

// Mensagens internas para gerenciamento de cache
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'CLEAR_API_CACHE') {
      console.log('[SW] Purgando cache de dados da API');
      caches.delete(API_CACHE);
    }
  }
});
