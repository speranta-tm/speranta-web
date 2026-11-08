import { Navigate, useParams } from 'react-router-dom'
import { legacyPaths } from '../content/books'
import { NotFoundPage } from './NotFoundPage'

/** Old WordPress links (/index.php/biblia/, /biblia/ …) land on the new pages. */
export function Legacy() {
  const { slug = '' } = useParams()
  const to = legacyPaths[slug.replace(/\/$/, '')]
  return to ? <Navigate to={to} replace /> : <NotFoundPage />
}
