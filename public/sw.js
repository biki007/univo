// Service Worker for Univo PWA
// Handles offline functionality, caching, and background sync

const CACHE_NAME = 'univo-v1.0.0';
const STATIC_CACHE = 'univo-static-v1.0.0';
const DYNAMIC_CACHE = 'univo-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/meeting/join',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.univo\.com\/auth\//,
  /^https:\/\/api\.univo\.com\/meetings\//,
  /^https:\/\/api\.univo\.com\/users\//,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationHandler(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy - for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale while revalidate strategy - for dynamic content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Navigation handler - for page requests
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, serving offline page:', error);
    const cachedResponse = await caches.match('/offline');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-meetings') {
    event.waitUntil(syncMeetingData());
  } else if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncChatMessages());
  }
});

// Sync meeting data when back online
async function syncMeetingData() {
  try {
    console.log('Service Worker: Syncing meeting data...');
    
    // Get pending meeting actions from IndexedDB
    const pendingActions = await getPendingActions('meetings');
    
    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          await removePendingAction('meetings', action.id);
          console.log('Service Worker: Synced meeting action', action.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync meeting action', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Sync chat messages when back online
async function syncChatMessages() {
  try {
    console.log('Service Worker: Syncing chat messages...');
    
    const pendingMessages = await getPendingActions('messages');
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          await removePendingAction('messages', message.id);
          console.log('Service Worker: Synced message', message.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync message', message.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Message sync failed', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have a new meeting invitation',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'join',
        title: 'Join Meeting',
        icon: '/icons/action-join.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Univo Meeting', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'join') {
    event.waitUntil(
      clients.openWindow('/meeting/join')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_MEETING_DATA') {
    cacheMeetingData(event.data.payload);
  } else if (event.data && event.data.type === 'QUEUE_ACTION') {
    queueOfflineAction(event.data.payload);
  }
});

// Cache meeting data for offline access
async function cacheMeetingData(meetingData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(meetingData), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/api/meetings/${meetingData.id}`, response);
    console.log('Service Worker: Meeting data cached', meetingData.id);
  } catch (error) {
    console.error('Service Worker: Failed to cache meeting data', error);
  }
}

// Queue offline actions for background sync
async function queueOfflineAction(action) {
  try {
    // In a real implementation, this would use IndexedDB
    console.log('Service Worker: Queued offline action', action);
    
    // Register for background sync
    await self.registration.sync.register(`background-sync-${action.type}`);
  } catch (error) {
    console.error('Service Worker: Failed to queue offline action', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingActions(type) {
  // In a real implementation, this would query IndexedDB
  return [];
}

async function removePendingAction(type, id) {
  // In a real implementation, this would remove from IndexedDB
  console.log(`Service Worker: Removed pending action ${type}:${id}`);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'meeting-reminders') {
    event.waitUntil(checkMeetingReminders());
  }
});

async function checkMeetingReminders() {
  try {
    console.log('Service Worker: Checking meeting reminders...');
    
    // In a real implementation, this would check for upcoming meetings
    // and show notifications as reminders
    
    const upcomingMeetings = await getUpcomingMeetings();
    
    for (const meeting of upcomingMeetings) {
      if (shouldShowReminder(meeting)) {
        await self.registration.showNotification(`Meeting Reminder: ${meeting.title}`, {
          body: `Your meeting starts in ${meeting.timeUntilStart} minutes`,
          icon: '/icons/icon-192x192.png',
          tag: `meeting-reminder-${meeting.id}`,
          actions: [
            { action: 'join', title: 'Join Now' },
            { action: 'snooze', title: 'Remind in 5 min' }
          ]
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to check meeting reminders', error);
  }
}

async function getUpcomingMeetings() {
  // Placeholder - would fetch from cache or API
  return [];
}

function shouldShowReminder(meeting) {
  // Logic to determine if reminder should be shown
  return meeting.timeUntilStart <= 10 && meeting.timeUntilStart > 0;
}

console.log('Service Worker: Loaded successfully');