import { adminApi } from './api'

/**
 * Phone alerts. What this browser can do:
 * - 'unsupported': no Web Push here at all;
 * - 'ios-install': an iPhone, where Safari only allows alerts for a site added to the
 *   home screen (Share › "Adaugă pe ecranul principal") and opened from there;
 * - 'denied': the person blocked notifications for the site in the browser settings;
 * - 'on' / 'off'.
 */
export type PushState = 'unsupported' | 'ios-install' | 'denied' | 'on' | 'off'

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches

function supported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

async function registration() {
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export async function pushState(): Promise<PushState> {
  if (isIos() && !isStandalone()) return 'ios-install'
  if (!supported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration('/')
  const sub = await reg?.pushManager.getSubscription()
  return sub ? 'on' : 'off'
}

/** The VAPID key arrives base64url; the browser wants raw bytes. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export async function turnOn(): Promise<PushState> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'

  const key = await adminApi.pushKey()
  if (!key) throw new Error('no push key')

  const reg = await registration()
  await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key.publicKey) }))

  await adminApi.pushSubscribe(sub.toJSON())
  return 'on'
}

export async function turnOff(): Promise<PushState> {
  const reg = await navigator.serviceWorker.getRegistration('/')
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    await adminApi.pushUnsubscribe(sub.endpoint).catch(() => {})
    await sub.unsubscribe()
  }
  return 'off'
}
