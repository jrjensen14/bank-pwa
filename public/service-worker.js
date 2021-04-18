const APP_PREFIX = 'budget-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;

const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png"
];

// installs the service worker
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('installing cache : ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activates service worker
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then((keyList) => {
      let cacheKeepList = keyList.filter((key) => {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeepList.push(CACHE_NAME);

      return Promise.all(
        keyList.map((key, i) => {
          if (cacheKeepList.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// intercepts fetch requests and caches the response
self.addEventListener('fetch', function (e) {
  if (e.request.url.includes('/api')) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // Since network request failed, get transaction history from the cache.
              console.log('responding with cache : ' + e.request.url);
              return cache.match(e.request);
            });
        })
    );
    return;
  }
  console.log('fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then((request) => {
      if (request) {
        console.log('responding with cache : ' + e.request.url);
        return request;
      } else {
        console.log('file is not cached, fetching : ' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

// // Cache resources
// self.addEventListener("install", function (event) {
//   // Perform install steps
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(function(cache) {
//       console.log('installing cache : ' + CACHE_NAME)
//       return cache.addAll(FILES_TO_CACHE);
//     })
//   );
// });

// // Respond with cached resources
// self.addEventListener("fetch", function (event) {
//   // cache all get requests to /api routes
//   if (event.request.url.includes("/api/")) {
//     event.respondWith(
//       caches
//       .open(DATA_CACHE_NAME)
//       .then(cache => {
//         return fetch(event.request)
//           .then(response => {
//             // If the response was good, clone it and store it in the cache.
//             if (response.status === 200) {
//               cache.put(event.request.url, response.clone());
//             }

//             return response;
//           })
//           .catch(err => {
//             console.log('responding with cache : ' + event.request.url)
//             // Network request failed, try to get it from the cache.
//             return cache.match(event.request);
//           });
//       })
//       // .catch(err => console.log(err))
//     );

//     return;
//   }
//   event.respondWith(
//     fetch(event.request).catch(function() {
//       return caches.match(event.request).then(function(response) {
//         if (response) {
//           return response;
//         } else if (event.request.headers.get("accept").includes("text/html")) {
//           // return the cached home page for all requests for html pages
//           return caches.match("/");
//         }
//       });
//     })
//   );
// });

// // Delete outdated caches
// self.addEventListener('activate', function (e) {
//   e.waitUntil(
//     caches.keys().then(function (keyList) {
//       // `keyList` contains all cache names under your username.github.io
//       // filter out ones that has this app prefix to create white list
//       let cacheKeeplist = keyList.filter(function (key) {
//         return key.indexOf(APP_PREFIX);
//       })
//       // add current cache name to white list
//       cacheKeeplist.push(CACHE_NAME);

//       return Promise.all(
//         keyList.map(function (key, i) {
//         if (cacheKeeplist.indexOf(key) === -1) {
//           console.log('deleting cache : ' + keyList[i] );
//           return caches.delete(keyList[i]);
//         }
//       }));
//     })
//   );
// });
