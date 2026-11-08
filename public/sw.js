// Service worker for the admins' phone alerts (Web Push) only. It does no caching:
// the site is always loaded fresh from the network.

self.addEventListener('push', (event) => {
  let data = { title: 'Biserica Speranța', body: '', url: '/admin' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    /* a payload we can't read still shows the default */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/apple-touch-icon.png',
      badge: '/favicon.png',
      data: { url: data.url },
      lang: 'ro',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/admin', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.location.origin + '/admin'))
      if (open) return open.navigate(url).then((w) => w && w.focus())
      return self.clients.openWindow(url)
    }),
  )
})
