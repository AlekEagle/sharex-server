let CACHE_NAME = 'v3';
let expectedCaches = [CACHE_NAME];
let urlsToCache = [
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js',
    'https://fonts.googleapis.com/css?family=K2D',
    'https://fonts.gstatic.com/s/k2d/v3/J7aTnpF2V0EjZKUsrLc.woff2',
    'https://fonts.gstatic.com/s/k2d/v3/J7aTnpF2V0EjcKUs.woff2',
    '/me/',
    '/me/upload/',
    '/me/uploads/',
    '/me/uploads/info/',
    '/assets/css/universal.css',
    '/assets/js/memory.js',
    '/assets/images/circle.png',
    '/assets/images/me_irl.webp',
    '/assets/images/empty.gif',
    '/assets/js/snackbar.js',
    '/assets/js/reloadOnOnline.js'
];
let file = null;

self.addEventListener('install', function (event) {
    self.skipWaiting();
    caches.keys().then(cacheNames => {
        console.log('Getting caches..');
        cacheNames.map(cacheName => {
            if (!expectedCaches.includes(cacheName)) {
                console.log(`Checking for ${cacheName}..`);
                caches.delete(cacheName).then(() => {
                    console.log(`Deleting cache ${cacheName}`);
                })
            }
        })
    })
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log(`Adding all urls to cache ${CACHE_NAME}`);
            return cache.addAll(urlsToCache.map(url => {
                console.log(`Adding ${url} to ${CACHE_NAME}`);
                return new Request(url);
            }));
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!expectedCaches.includes(key)) {
                    return caches.delete(key);
                }
            })
        ))
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method === 'POST' && event.request.url.includes('/me/upload/')) {
        event.respondWith((async () => {
            const formData = await event.request.formData();
            const shareFile = formData.get('file');
            file = shareFile;
            return Response.redirect('/me/upload/', 303);
        })());
    } else if (event.request.method !== 'POST') {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(
                        function (response) {
                            // Check if we received a valid response
                            if (!response || response.status !== 200 || response.type === 'opaque' || response.url.includes('/api/')) {
                                return response;
                            }

                            // IMPORTANT: Clone the response. A response is a stream
                            // and because we want the browser to consume the response
                            // as well as the cache consuming the response, we need
                            // to clone it so we have two streams.
                            var responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(function (cache) {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    } else {
        event.respondWith(fetch(event.request).then(res => { return res; }));
    }
});

self.addEventListener('message', event => {
    if (event.data.action === 'receive-share-file' && file !== null) {
        setTimeout(() => { 
            event.source.postMessage({ file, action: 'load-image' });
            file = null;
        }, 1000);
    }
});