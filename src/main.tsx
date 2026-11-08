import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { Layout } from './components/Layout'
import { SiteProvider } from './lib/site'
import { AnnouncementPage, AnnouncementsPage } from './pages/AnnouncementPages'
import { BookPage } from './pages/BookPage'
import { BooksPage } from './pages/BooksPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { KidsPage } from './pages/KidsPage'
import { Legacy } from './pages/Legacy'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ThanksPage } from './pages/ThanksPage'

// eslint-disable-next-line react/only-export-components
const AdminApp = lazy(() => import('./admin/AdminApp'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<div className="min-h-dvh bg-surface-2" />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="activitati-pentru-copii" element={<KidsPage />} />
            <Route path="carti-gratuite" element={<BooksPage />} />
            <Route path="carti-gratuite/:slug" element={<BookPage />} />
            <Route path="anunturi" element={<AnnouncementsPage />} />
            <Route path="anunturi/:slug" element={<AnnouncementPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="multumim" element={<ThanksPage />} />
            <Route path="confidentialitate" element={<PrivacyPage />} />
            <Route path="index.php/:slug" element={<Legacy />} />
            <Route path=":slug" element={<Legacy />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  </StrictMode>,
)
