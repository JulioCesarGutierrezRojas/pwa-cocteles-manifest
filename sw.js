const cacheName = 'cocktail-pwa-v1';

const appShellAssets = [
    './',
    './index.html',
    './main.js',
    './app.js'
]

const OFFLINE_COCKTAIL_JSON = {
    drinks: [{
        idDrink: "00000",
        strDrink: "🚫 ¡Sin Conexión ni Datos Frescos!",
        strTags: "FALLBACK",
        strCategory: "Desconectado",
        strInstructions: "No pudimos obtener resultados en este momento. Este es un resultado GENÉRICO para demostrar que la aplicación NO SE ROMPE. Inte nta conectarte de nuevo.",
        strDrinkThumb: "https://via.placeholder.com/200300?text=OFFLINE",
        strIngredient1: "Servicio Worker",
        strIngredient2: "Fallback JSON"
    }]
};

self.addEventListener('install', event => {
    console.log("Instalando y precacheando el App Shell");
    event.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        await cache.addAll(appShellAssets);
        await self.skipWaiting();
    })())
})

self.addEventListener('activate', event => {
    console.log("Service Worker activado");
    event.waitUntil((async () => {
        await self.clients.claim();
    }))
})

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    event.respondWith((async () => {
        // --- ESTRATEGIA 1: CACHE ONLY (para el App Shell) ---
        const isAppShellRequest = appShellAssets.some(asset =>
            requestUrl.pathname === asset || requestUrl.pathname === asset.substring(1)
        );

        if (isAppShellRequest) {
            console.log(`[SW] App Shell: CACHE ONLY para ${requestUrl.pathname}`);

            const response = await caches.match(event.request);
            // Devolvemos la respuesta del caché o un error si no existe
            return response || new Response('App Shell Asset Missing', { status: 500 });
        }

        // --- ESTRATEGIA 2: NETWORK-FIRST con FALLBACK de JSON (para la API) ---
        if (requestUrl.host === 'www.thecocktaildb.com' && requestUrl.pathname.includes('/search.php')) {
            console.log('[SW] API: NETWORK-FIRST con Fallback a JSON Genérico.');

            try {
                // Intentamos obtener desde la red primero
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                // Si la red falla, devolvemos el JSON de fallback
                console.log('[SW] ❌ Fallo de red. Devolviendo JSON de Fallback.');
                return new Response(JSON.stringify(OFFLINE_COCKTAIL_JSON), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Si no coincide con ninguna estrategia, dejamos que siga su curso normal
        return fetch(event.request);
    })());
});
