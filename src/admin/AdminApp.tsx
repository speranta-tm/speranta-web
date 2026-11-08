import { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AdminsPage } from './pages/AdminsPage'
import { AnnouncementEditorPage, AnnouncementsPage } from './pages/AnnouncementsPages'
import { AcceptInvitePage, ForgotPasswordPage, LoginPage, ResetPasswordPage } from './pages/AuthPages'
import { BookEditorPage } from './pages/BookEditorPage'
import { BooksPage } from './pages/BooksPage'
import { DashboardPage } from './pages/DashboardPage'
import { MessagesPage } from './pages/MessagesPage'
import { OrdersPage } from './pages/OrdersPage'
import { SchedulePage } from './pages/SchedulePage'
import { SignupsPage } from './pages/SignupsPage'

/**
 * Everything under /admin. Loaded on demand from main.tsx, so a visitor to the
 * public pages never downloads the admin.
 *
 * Paths match the links in the notification emails and phone alerts
 * (/admin/comenzi/:id, /admin/inscrieri/:id, /admin/mesaje/:id, /admin/invitatie,
 * /admin/resetare-parola).
 */
export default function AdminApp() {
  // The admin can be added to a phone's home screen (needed for alerts on iPhone);
  // the public site deliberately has no manifest.
  useEffect(() => {
    const link = Object.assign(document.createElement('link'), { rel: 'manifest', href: '/manifest.webmanifest' })
    document.head.appendChild(link)
    const robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' })
    document.head.appendChild(robots)
    return () => {
      link.remove()
      robots.remove()
    }
  }, [])

  return (
    <Routes>
      <Route path="autentificare" element={<LoginPage />} />
      <Route path="parola-uitata" element={<ForgotPasswordPage />} />
      <Route path="resetare-parola" element={<ResetPasswordPage />} />
      <Route path="invitatie" element={<AcceptInvitePage />} />
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="comenzi" element={<OrdersPage />} />
        <Route path="comenzi/:id" element={<OrdersPage />} />
        <Route path="inscrieri" element={<SignupsPage />} />
        <Route path="inscrieri/:id" element={<SignupsPage />} />
        <Route path="mesaje" element={<MessagesPage />} />
        <Route path="mesaje/:id" element={<MessagesPage />} />
        <Route path="anunturi" element={<AnnouncementsPage />} />
        <Route path="anunturi/:id" element={<AnnouncementEditorPage />} />
        <Route path="program" element={<SchedulePage />} />
        <Route path="carti" element={<BooksPage />} />
        <Route path="carti/:id" element={<BookEditorPage />} />
        <Route path="administratori" element={<AdminsPage />} />
        <Route
          path="*"
          element={
            <p className="t-body text-body">
              Pagina nu există. <Link to="/admin" className="font-semibold text-primary">Înapoi la panou</Link>
            </p>
          }
        />
      </Route>
    </Routes>
  )
}
