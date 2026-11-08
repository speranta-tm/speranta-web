import hero from '../assets/img/hero.webp'
import cladire from '../assets/img/cladire.webp'
import copii from '../assets/img/copii-ilustratie.webp'
import cineSuntem from '../assets/img/cine-suntem.webp'
import documentar from '../assets/img/documentar.webp'
import { AnnouncementCard, BookCard, MapEmbed, YouTubeEmbed } from '../components/Bits'
import { useTitle } from '../lib/useTitle'
import { ButtonLink } from '../components/Button'
import { Icon, type IconName } from '../components/Icon'
import { church } from '../content/church'
import { dayName, span } from '../lib/format'
import { useFlyerUrl, useSite } from '../lib/site'
import { useAnnouncements } from '../lib/useAnnouncements'

/** Figma › Desktop › "Acasă · Desktop" and Mobile › "Acasă · Mobile". */
export function HomePage() {
  useTitle('')
  const site = useSite()
  const flyer = useFlyerUrl()
  const announcements = useAnnouncements(1, 3, true)

  return (
    <>
      {/* Hero, with the schedule card overlapping its lower edge. */}
      <section className="relative">
        <div className="relative flex min-h-[451px] items-center justify-center overflow-hidden lg:h-[720px]">
          <img src={hero} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/70" />
          <div className="relative flex max-w-[720px] flex-col items-center gap-4 px-4 pt-[72px] pb-24 text-center lg:gap-6 lg:pt-0 lg:pb-40">
            <h1 className="t-display text-white">
              Biserica Adventistă
              <br className="hidden lg:block" /> de Ziua a Șaptea
            </h1>
            <p className="text-xl leading-7 font-semibold text-white lg:text-2xl">{church.place}</p>
            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <ButtonLink to={flyer} icon="download" newTab block className="sm:w-auto">
                Descarcă pliantul lunar
              </ButtonLink>
              <ButtonLink to="/activitati-pentru-copii" variant="on-dark" block className="sm:w-auto">
                Activități pentru copii
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="container-page relative -mt-16 lg:-mt-[166px]">
          <div className="mx-auto flex max-w-[1049px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-[0_20px_50px_rgb(26_32_44/0.14)] lg:flex-row lg:items-center lg:gap-10 lg:rounded-[24px] lg:py-6 lg:pr-12 lg:pl-6">
            <img
              src={cladire}
              alt="Clădirea Bisericii Speranța din Timișoara"
              className="h-[180px] w-full rounded-[14px] object-cover lg:h-[214px] lg:w-[320px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-3">
              <p className="t-eyebrow text-primary">Program</p>
              <h2 className="t-h2 text-ink">Alăturați-vă în fiecare vineri și sâmbătă!</h2>
              <ul className="flex flex-col gap-2 pt-1">
                {site.services.map((s) => (
                  <li key={`${s.day}${s.start}`} className="t-body flex items-center gap-2.5">
                    <Icon name="clock" size={18} className="text-primary" />
                    <span className="w-[72px] font-semibold text-ink">{dayName[s.day]}</span>
                    <span className="text-body">{span(s.start, s.end)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cărți gratuite */}
      <section className="container-page flex flex-col items-center gap-5 py-14 lg:gap-12 lg:pt-[72px] lg:pb-24">
        <div className="flex max-w-[732px] flex-col gap-3 text-center">
          <h2 className="t-h1 text-ink">Cărți gratuite</h2>
          <p className="t-lead text-body">
            Îți oferim gratuit aceste cărți, cu livrare la domiciliu în Timișoara și împrejurimi.
          </p>
        </div>
        <ul className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-[18px]">
          {site.books.map((b) => (
            <li key={b.slug}>
              <BookCard book={b} />
            </li>
          ))}
        </ul>
        <ButtonLink to="/carti-gratuite" variant="ghost" icon="arrow-right">
          Vezi toate cărțile
        </ButtonLink>
      </section>

      {/* Activități pentru copii */}
      <section className="bg-surface-2">
        <div className="container-page flex flex-col gap-4 py-14 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
          <img
            src={copii}
            alt=""
            loading="lazy"
            className="h-[268px] w-full rounded-[20px] object-cover lg:h-[420px] lg:w-[560px] lg:shrink-0 lg:rounded-[24px]"
          />
          <div className="flex flex-col gap-4 lg:gap-5">
            <p className="t-eyebrow text-primary">Pentru copii</p>
            <h2 className="t-h1 text-ink">Activități pentru copii</h2>
            <p className="t-lead hidden text-ink-2 lg:block">
              La Biserica Adventistă de Ziua a Șaptea Speranța Timișoara organizăm activități pentru copii cu
              tematică biblică.
            </p>
            <p className="t-body text-body">
              <span className="lg:hidden">Organizăm activități pentru copii cu tematică biblică. </span>
              Copiii descoperă povestirile biblice într-un mod plăcut și creativ, prin joacă, activități interactive
              și timp de calitate petrecut alături de alți copii, într-un mediu sigur și primitor.
            </p>
            <ul className="hidden flex-wrap gap-3 lg:flex">
              <Chip icon="calendar">În fiecare sâmbătă</Chip>
              <Chip icon="users">0–7 ani · 7–14 ani</Chip>
              <Chip icon="gift">Gratuit</Chip>
            </ul>
            <ButtonLink to="/activitati-pentru-copii" icon="arrow-right" block className="lg:w-auto lg:self-start">
              Detalii și înscriere
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Anunțuri: hidden entirely until there is something to show. */}
      {announcements.state === 'ready' && announcements.data.items.length > 0 && (
        <section className="container-page flex flex-col gap-4 py-14 lg:gap-12 lg:py-24">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="t-eyebrow text-primary">Noutăți</p>
              <h2 className="t-h1 text-ink">Anunțuri</h2>
            </div>
            <div className="hidden lg:block">
              <ButtonLink to="/anunturi" variant="ghost" icon="arrow-right">
                Toate anunțurile
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            {announcements.data.items.map((a) => (
              <AnnouncementCard key={a.slug} a={a} />
            ))}
          </div>
          <div className="lg:hidden">
            <ButtonLink to="/anunturi" variant="secondary" icon="arrow-right">
              Toate anunțurile
            </ButtonLink>
          </div>
        </section>
      )}

      {/* Transmisiuni live */}
      <section className="bg-ink">
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center lg:gap-5 lg:py-24">
          <p className="t-eyebrow text-line">Transmisiuni live</p>
          <h2 className="t-h2 max-w-[960px] text-white">
            Urmăriți transmisiunile din Biserica Adventistă de Ziua a Șaptea Speranța, Timișoara
          </h2>
          <ButtonLink to={church.youtube} newTab icon="youtube" block className="sm:w-auto">
            Transmisiuni live pe YouTube
          </ButtonLink>
        </div>
      </section>

      {/* Cine suntem noi? */}
      <section className="container-page flex flex-col gap-4 py-14 lg:flex-row lg:items-center lg:gap-20 lg:py-24">
        <img
          src={cineSuntem}
          alt="Biserica Speranța la inaugurare, 18 mai 2019"
          loading="lazy"
          className="h-[400px] w-full rounded-[20px] object-cover lg:h-[600px] lg:w-[480px] lg:shrink-0 lg:rounded-[24px]"
        />
        <div className="flex flex-col gap-4 lg:gap-5">
          <p className="t-eyebrow text-primary">Despre noi</p>
          <h2 className="t-h1 text-ink">Cine suntem noi?</h2>
          <p className="t-h3 text-ink-2">Care este scopul vieții? De ce există rău în lume, dacă există Dumnezeu?</p>
          <p className="t-lead text-body">
            Suntem din Biserica Adventistă Speranța, iar credința noastră este bazată pe Biblie. Misiunea noastră
            este de a spune lumii despre măreția lui Dumnezeu.
          </p>
          <p className="t-body text-body lg:text-xl lg:leading-[30px]">
            Ne dorim să oferim răspunsuri la întrebările profunde ale vieții, să creăm sens și să cultivăm o
            înțelegere mai profundă a existenței noastre, oferind perspectivă asupra scopului, valorilor și direcției
            pe care o urmăm în această lume.
          </p>
          <ButtonLink to={church.facebook} newTab variant="secondary" icon="facebook" block className="lg:w-auto lg:self-start">
            Vizitează pagina de Facebook
          </ButtonLink>
        </div>
      </section>

      {/* Documentarul */}
      <section className="bg-surface-2">
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center lg:gap-8 lg:py-24">
          <div className="flex max-w-[820px] flex-col gap-3">
            <h2 className="t-h1 text-ink">Nu ai auzit până acum despre Biserica Adventistă?</h2>
            <p className="t-lead text-body">Urmărește documentarul „Cine sunt adventiștii”:</p>
          </div>
          <div className="w-full max-w-[960px]">
            <YouTubeEmbed videoId={church.documentaryVideoId} poster={documentar} title="Cine sunt adventiștii" />
          </div>
        </div>
      </section>

      {/* Locație: card over the map on desktop, stacked on a phone. */}
      <section className="relative">
        <div className="container-page flex flex-col items-center gap-3 pt-14 pb-6 text-center lg:hidden">
          <p className="t-eyebrow text-primary">Locație</p>
          <h2 className="t-h2 text-ink">{church.address}</h2>
          <ButtonLink to={church.directions} newTab icon="navigation" block>
            Indicații de orientare
          </ButtonLink>
        </div>
        <MapEmbed className="h-[260px] lg:h-[480px]" />
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-[24px] bg-white px-12 py-8 text-center shadow-[0_20px_50px_rgb(26_32_44/0.18)]">
            <p className="t-eyebrow text-primary">Locație</p>
            <h2 className="t-h2 text-ink">{church.address}</h2>
            <ButtonLink to={church.directions} newTab icon="navigation" className="mt-1">
              Indicații de orientare
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

function Chip({ icon, children }: { icon: IconName; children: string }) {
  return (
    <li className="t-small flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-ink-2">
      <Icon name={icon} size={16} className="text-primary" />
      {children}
    </li>
  )
}
