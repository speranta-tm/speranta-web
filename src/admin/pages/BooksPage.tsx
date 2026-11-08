import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { ButtonLink } from '../../components/Button'
import { coverFor } from '../../content/books'
import { apiUrl } from '../../lib/api'
import { cx } from '../../lib/cx'
import { useTitle } from '../../lib/useTitle'
import { adminApi, type AdminBook } from '../api'
import { useRemote } from '../data'
import { count } from '../labels'
import { Card, ErrorNote, Loading, PageHead, Switch } from '../ui'

/**
 * Figma › "Admin · Cărți". The order here is the order on the site; a book switched
 * off shows "Stoc epuizat" and takes no orders. "Carte nouă" and "Editează" open the
 * book editor.
 */
export function BooksPage() {
  useTitle('Cărți')
  const books = useRemote('books', () => adminApi.books())
  const [dragging, setDragging] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (books.state === 'loading') return <Loading />
  if (books.state === 'error') return <ErrorNote>Cărțile nu au putut fi încărcate.</ErrorNote>
  const list = books.data

  async function run(change: Promise<AdminBook[]>) {
    setError(null)
    try {
      books.set(await change)
    } catch {
      setError('Modificarea nu a reușit. Încearcă din nou.')
      books.reload()
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= list.length || from === to) return
    const next = [...list]
    const [b] = next.splice(from, 1)
    next.splice(to, 0, b)
    books.set(next)
    void run(adminApi.reorderBooks(next.map((x) => x.id)))
  }

  return (
    <>
      <PageHead title="Cărți" sub="Ordinea de aici e ordinea de pe site. Oprește o carte când se termină stocul.">
        <ButtonLink to="/admin/carti/nou" icon="book-open">
          Carte nouă
        </ButtonLink>
      </PageHead>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Card>
        <ul>
          {list.map((b, i) => {
            const cover = coverFor(b.slug, b.coverUrl, apiUrl)
            return (
              <li
                key={b.id}
                draggable
                onDragStart={() => setDragging(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragging !== null) move(dragging, i)
                  setDragging(null)
                }}
                onDragEnd={() => setDragging(null)}
                className={cx('flex items-center gap-4 border-t border-line px-4 py-3.5 first:border-t-0 sm:px-5', dragging === i && 'opacity-50')}
              >
                <span className="t-body hidden cursor-grab font-semibold text-muted select-none sm:inline" aria-hidden="true">
                  ⋮⋮
                </span>
                <span className="flex flex-col">
                  <button type="button" aria-label={`Mută „${b.title}” mai sus`} disabled={i === 0} onClick={() => move(i, i - 1)} className="text-muted hover:text-primary disabled:opacity-30">
                    <Icon name="chevron-down" size={18} className="rotate-180" />
                  </button>
                  <button type="button" aria-label={`Mută „${b.title}” mai jos`} disabled={i === list.length - 1} onClick={() => move(i, i + 1)} className="text-muted hover:text-primary disabled:opacity-30">
                    <Icon name="chevron-down" size={18} />
                  </button>
                </span>
                {cover && <img src={cover} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />}
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/admin/carti/${b.id}`} className="t-body font-semibold text-ink hover:text-primary">
                    {b.title}
                  </Link>
                  <span className="t-small text-muted">
                    {b.isAvailable
                      ? `${count(b.newThisMonth, 'comandă', 'comenzi')} luna aceasta`
                      : 'Oprită: „Stoc epuizat” pe site'}
                  </span>
                </div>
                <span className={cx('t-small hidden sm:inline', b.isAvailable ? 'text-ink-2' : 'text-muted')}>
                  {b.isAvailable ? 'Activă' : 'Oprită'}
                </span>
                <span className="hidden sm:block">
                  <ButtonLink to={`/admin/carti/${b.id}`} variant="ghost" size="s">
                    Editează
                  </ButtonLink>
                </span>
                <Switch
                  checked={b.isAvailable}
                  label={`„${b.title}” disponibilă`}
                  onChange={(v) => {
                    books.set(list.map((x) => (x.id === b.id ? { ...x, isAvailable: v } : x)))
                    void run(adminApi.setBookAvailable(b.id, v))
                  }}
                />
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
