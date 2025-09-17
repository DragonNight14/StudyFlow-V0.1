// Enhanced Service Worker for Offline-First HW Tracker

const CACHE_NAME = 'hw-tracker-v2.0';
const STATIC_CACHE = 'hw-tracker-static-v2.0';
const DYNAMIC_CACHE = 'hw-tracker-dynamic-v2.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    './',
    './index.html',
    './styles.css',
    './animations.css',
    './settings.css',
    './enhanced-script.js',
    './enhanced-settings.js',
    './api-integration.js',
    './create-assignment.html',
    './create-assignment.js',
    './login.html',
    './login.js',
    './manifest.json',
    './icon-192x192.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests differently
    if (request.url.includes('/api/')) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static files with cache-first strategy
    if (STATIC_FILES.some(file => request.url.endsWith(file))) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request);
                })
        );
        return;
    }

    // Handle other requests with network-first strategy
    event.respondWith(
        fetch(request)
            .then(response => {
                // Clone response for caching
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(request, responseClone);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        // Return generic offline response
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle API requests with offline queue
async function handleAPIRequest(request) {
    try {
        const response = await fetch(request);
        
        // Cache successful API responses
        if (response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Queue request for when online
        await queueOfflineRequest(request);
        
        // Return offline response
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Request queued for when connection is restored'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Queue requests for offline processing
async function queueOfflineRequest(request) {
    const db = await openDB();
    const transaction = db.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    
    const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now()
    };
    
    await store.add(requestData);
}

// IndexedDB for offline queue
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('hw-tracker-offline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('requests')) {
                const store = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp');
            }
            
            if (!db.objectStoreNames.contains('assignments')) {
                const store = db.createObjectStore('assignments', { keyPath: 'id' });
                store.createIndex('dueDate', 'dueDate');
                store.createIndex('source', 'source');
            }
        };
    });
}

// Background sync for offline queue
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(processOfflineQueue());
    }
});

// Process queued requests when back online
async function processOfflineQueue() {
    try {
        const db = await openDB();
        const transaction = db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        const requests = await store.getAll();
        
        for (const requestData of requests) {
            try {
                const response = await fetch(requestData.url, {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body || undefined
                });
                
                if (response.ok) {
                    // Remove successfully processed request
                    await store.delete(requestData.id);
                }
            } catch (error) {
                console.error('Failed to process queued request:', error);
            }
        }
    } catch (error) {
        console.error('Failed to process offline queue:', error);
    }
}

// Push notifications for assignment reminders
self.addEventListener('push', event => {
    const options = {
        body: 'You have assignments due soon!',
        icon: './icon-192x192.png',
        badge: './icon-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            url: './'
        },
        actions: [
            {
                action: 'view',
                title: 'View Assignments'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.data = data.data || options.data;
    }

    event.waitUntil(
        self.registration.showNotification('HW Tracker', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || './')
        );
    }
});

// Periodic background sync for assignment updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'assignment-sync') {
        event.waitUntil(syncAssignments());
    }
});

// Sync assignments in background
async function syncAssignments() {
    try {
        // This would trigger the API integration to sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                action: 'syncAssignments'
            });
        });
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Message handling from main thread
self.addEventListener('message', event => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'CACHE_ASSIGNMENT':
            cacheAssignment(data);
            break;
        case 'SCHEDULE_NOTIFICATION':
            scheduleNotification(data);
            break;
    }
});

// Cache assignment data for offline access
async function cacheAssignment(assignment) {
    try {
        const db = await openDB();
        const transaction = db.transaction(['assignments'], 'readwrite');
        const store = transaction.objectStore('assignments');
        await store.put(assignment);
    } catch (error) {
        console.error('Failed to cache assignment:', error);
    }
}

// Schedule push notifications for assignment deadlines
function scheduleNotification(data) {
    const { assignment, reminderTime } = data;
    const now = Date.now();
    const dueTime = new Date(assignment.dueDate).getTime();
    const notificationTime = dueTime - reminderTime;

    if (notificationTime > now) {
        setTimeout(() => {
            self.registration.showNotification('Assignment Due Soon!', {
                body: `"${assignment.title}" is due soon`,
                icon: './icon-192x192.png',
                badge: './icon-192x192.png',
                data: { assignmentId: assignment.id }
            });
        }, notificationTime - now);
    }
}

// Network status monitoring
self.addEventListener('online', () => {
    processOfflineQueue();
});

// Clean up old cached data periodically
setInterval(async () => {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response.headers.get('date');
            
            if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
                await cache.delete(request);
            }
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}, 24 * 60 * 60 * 1000); // Run daily
