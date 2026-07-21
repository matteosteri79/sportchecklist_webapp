const CACHE_NAME="sport-checklist-v2"

const urlsToCache=[

    "./",
    "./index.html",
    "./manifest.json",
    "./assets/css/style.css",
    "./assets/js/app.js",
    "./assets/js/modal.js",
    "./assets/js/utils.js",
    "./assets/data/it.json",
    "./assets/images/icon-192.png",
    "./assets/images/icon-512.png",
    "./assets/images/image_header.png",
    "./assets/images/logo_sportchecklist_en.png",
    "./assets/images/logo_sportchecklist_it.png"

]

self.addEventListener("install",event=>{

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache=>cache.addAll(urlsToCache))

    )

})

self.addEventListener("activate",event=>{

    event.waitUntil(

        caches.keys()
            .then(keys=>Promise.all(
                keys
                    .filter(key=>key !== CACHE_NAME)
                    .map(key=>caches.delete(key))
            ))

    )

})

self.addEventListener("fetch",event=>{

    event.respondWith(

        caches.match(event.request)
            .then(response=>{

                return response || fetch(event.request)

            })

    )

})
