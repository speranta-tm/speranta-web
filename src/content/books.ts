import bibliaCover from '../assets/img/covers/biblia.webp'
import viataCover from '../assets/img/covers/viata-lui-isus.webp'
import tragediaCover from '../assets/img/covers/tragedia-veacurilor.webp'
import caleaCover from '../assets/img/covers/calea-catre-hristos.webp'
import eleviCover from '../assets/img/covers/biblia-pentru-elevi.webp'
import mesajulCover from '../assets/img/covers/mesajul-lui-dumnezeu-pentru-tine.webp'
import bibliaBanner from '../assets/img/banners/biblia.webp'
import viataBanner from '../assets/img/banners/viata-lui-isus.webp'
import tragediaBanner from '../assets/img/banners/tragedia-veacurilor.webp'
import caleaBanner from '../assets/img/banners/calea-catre-hristos.webp'
import eleviBanner from '../assets/img/banners/biblia-pentru-elevi.webp'
import mesajulBanner from '../assets/img/banners/mesajul-lui-dumnezeu-pentru-tine.webp'

/**
 * The text of each book page, as designed in Figma (Desktop › "Carte · …").
 * Which questions each order form asks comes from the API (/site), so the two
 * can never disagree about what is required.
 */
export interface BookContent {
  slug: string
  /** Card and breadcrumb title. */
  title: string
  /** The home page card, where long titles are shortened to fit two lines. */
  cardTitle: string
  /** The page heading. */
  heading: string
  /** One line on the "Cărți gratuite" catalogue. */
  blurb: string
  cover: string
  banner: string
  lead: string
  paragraphs: string[]
  benefits?: string[]
  closing?: string
  /** "Comandă o Biblie" / "Comandă cartea" */
  formEyebrow: string
  /** "Primește o Biblie gratuit" / "Primește gratuit „…”" */
  formTitle: string
}

export const books: BookContent[] = [
  {
    slug: 'biblia',
    title: 'Biblia',
    cardTitle: 'Biblia',
    heading: 'Biblia sau Sfânta Scriptură',
    blurb: 'Biblia sau Sfânta Scriptură — Cartea care a schimbat milioane de vieți.',
    cover: bibliaCover,
    banner: bibliaBanner,
    lead: 'Cauți sens? Răspunsuri? Vrei să afli ce rezervă viitorul?',
    paragraphs: [
      'S-ar putea ca răspunsul să fie mai aproape decât crezi — într-o Carte care a schimbat milioane de vieți. Îți oferim cadou o Biblie, complet gratuit.',
      'Dumnezeu are un mesaj personal pentru tine, iar fiecare pagină poate fi începutul unei noi călătorii.',
    ],
    benefits: [
      'Poți descoperi tu singur adevărul Bibliei și sfaturile lui Dumnezeu pentru tine.',
      'Dacă nu ai încă o Biblie, ne bucurăm să ți-o oferim noi, fără niciun cost.',
      'Poți studia direct în liniștea casei tale.',
    ],
    closing: 'Dă-ți o șansă să-L cunoști pe Dumnezeu prin Cuvântul Său.',
    formEyebrow: 'Comandă o Biblie',
    formTitle: 'Primește o Biblie gratuit',
  },
  {
    slug: 'viata-lui-isus',
    title: 'Viața lui Isus',
    cardTitle: 'Viața lui Isus',
    heading: 'Viața lui Isus',
    blurb: 'Ellen G. White despre Isus din Evanghelii, Mesia din profeții, Cel mort și înviat.',
    cover: viataCover,
    banner: viataBanner,
    lead: 'Dacă ai ajuns pe această pagină, înseamnă că vrei să afli mai multe despre cine a fost Isus. Ne bucurăm să îți oferim această oportunitate!',
    paragraphs: [
      'Despre Isus din Nazaret s-a spus: „Niciodată n-a vorbit vreun om ca omul acesta” (Ioan 7:46). Despre autoarea cărții Viața lui Isus s-ar putea spune: „Puțini au scris ca ea despre Omul acesta.”',
      'Citind această carte, Îl vei descoperi pe adevăratul Isus din Evanghelii, pe Mesia din profețiile Vechiului Testament, pe Cel mort și înviat. Pe Cel ce plânge alături de cei suferinzi și îi ține în brațe pe cei mici.',
      'Nu va fi doar o lectură, ci o întâlnire cu Acela care a spus: „Eu sunt Calea, Adevărul și Viața.”',
      'Autoarea cărții, Ellen G. White (1827 – 1915), a fost o persoană cu daruri spirituale remarcabile. A scris peste 40 de cărți și 5000 de articole pe teme diverse: religie, educație, relații sociale, profeție, sănătate și management. Opera sa este tradusă în multe limbi, iar în română sunt disponibile peste 50 de volume.',
    ],
    formEyebrow: 'Comandă cartea',
    formTitle: 'Primește gratuit „Viața lui Isus”',
  },
  {
    slug: 'tragedia-veacurilor',
    title: 'Tragedia veacurilor',
    cardTitle: 'Tragedia veacurilor',
    heading: 'Tragedia veacurilor',
    blurb: 'Marea luptă dintre adevăr și minciună, de-a lungul istoriei lumii.',
    cover: tragediaCover,
    banner: tragediaBanner,
    lead: 'Tragedia veacurilor se numără printre cele mai cunoscute și citite cărți ale scriitoarei creștine Ellen G. White, fiind a cincea dintr-o serie care prezintă istoria lumii din perspectiva Bibliei și a creștinismului.',
    paragraphs: [
      'Volumul acesta abordează luptele din trecut pentru a scoate în evidență faptele și principiile care vor influența decisiv mersul lumii și evenimentele viitoare. În paginile sale sunt dezvăluite scenele marii lupte dintre adevăr și minciună, înșelăciunile lui Satana și mijloacele prin care i se poate rezista cu succes. Cititorii vor găsi o soluție satisfăcătoare pentru marea problemă a răului și a suferinței și vor descoperi dreptatea și iubirea lui Dumnezeu.',
    ],
    formEyebrow: 'Comandă cartea',
    formTitle: 'Primește gratuit „Tragedia veacurilor”',
  },
  {
    slug: 'calea-catre-hristos',
    title: 'Calea către Hristos',
    cardTitle: 'Calea către Hristos',
    heading: 'Calea către Hristos',
    blurb: 'Un ABC al vieții spirituale, pas cu pas spre Isus Hristos.',
    cover: caleaCover,
    banner: caleaBanner,
    lead: 'Acest ABC al vieții spirituale, un mic tratat în domeniul devoțiunii, își enunță chiar din titlu misiunea pe care o are.',
    paragraphs: [
      'Cartea îl îndrumă pe cititor spre Isus Hristos, ca fiind Singurul care poate să împlinească nevoile sufletului. Pașii celui care se simte nesigur sau cuprins de îndoială sunt conduși pe cărarea păcii, iar cel ce caută neprihănirea și desăvârșirea caracterului este îndrumat, pas cu pas, pe calea adevăratei viețuiri creștine.',
      'Cartea dezvăluie secretul biruinței și descoperă, într-o manieră simplă, harul mântuitor și puterea susținătoare a Marelui Prieten al întregii omeniri.',
    ],
    formEyebrow: 'Comandă cartea',
    formTitle: 'Primește gratuit „Calea către Hristos”',
  },
  {
    slug: 'biblia-pentru-elevi',
    title: 'Biblia pentru elevi',
    cardTitle: 'Biblia pentru elevi',
    heading: 'Biblia pentru elevi',
    blurb: 'Scriptura pe înțelesul copiilor: limbaj clar și ilustrații pline de culoare.',
    cover: eleviCover,
    banner: eleviBanner,
    lead: '„Biblia pentru elevi” este genul de carte care face Scriptura accesibilă, prietenoasă și plină de culoare pentru copilul tău.',
    paragraphs: [
      'Nu este doar o simplă Biblie, ci un ghid care îl ajută să înțeleagă mai ușor povestirile, personajele și ideile biblice. Folosește un limbaj clar, explicații scurte pe marginea paginii și ilustrații atractive, și este concepută în așa fel încât copilul tău să citească singur povestirile biblice fără să se plictisească.',
      'Dacă copilul tău e mai mic și încă nu știe să citească, i-o poți citi tu, descoperind împreună momentele minunate din Biblie, eroii credinței, oamenii lui Dumnezeu care și-au păstrat credința chiar și în momente grele.',
    ],
    benefits: [
      'Poți descoperi povestirile Bibliei împreună cu copilul tău, sau le poate descoperi și el singur.',
      'Dacă nu ai această carte, suntem bucuroși să ți-o oferim complet gratuit.',
      'Copilul tău poate citi direct în liniștea casei.',
    ],
    closing: 'Dă-i o șansă copilului tău să-L cunoască pe Dumnezeu prin Cuvântul Său.',
    formEyebrow: 'Comandă cartea',
    formTitle: 'Primește gratuit „Biblia pentru elevi”',
  },
  {
    slug: 'mesajul-lui-dumnezeu-pentru-tine',
    title: 'Mesajul lui Dumnezeu pentru tine',
    cardTitle: 'Mesajul lui Dumnezeu pt. tine',
    heading: 'Mesajul lui Dumnezeu pentru tine',
    blurb: 'Povestiri și versete biblice de citit împreună cu copilul.',
    cover: mesajulCover,
    banner: mesajulBanner,
    lead: 'O colecție a celor mai importante povestiri și versete din Biblie, într-o traducere contemporană. Citindu-le la rând, capitol cu capitol, ajungi să cunoști Cuvântul lui Dumnezeu ca pe o povestire în desfășurare.',
    paragraphs: [
      'Cel mai interesant este că și tu, ca părinte, ai un rol în această poveste. Cartea este concepută pentru a fi citită copiilor de către părinți. Fiecare capitol al acestei ediții frumos ilustrate conține texte luate direct din Biblie, astfel că poți citi Cuvântul lui Dumnezeu împreună cu copilul tău, așa cum a fost scris.',
      'Cartea are de asemenea scurte explicații ale evenimentelor culturale și istorice, ca să te ajute să urmărești acțiunea, și câteva teme de reflecție despre cum se poate aplica textul la viața noastră de astăzi.',
    ],
    benefits: [
      'Poți descoperi minunatele povestiri ale Bibliei împreună cu copilul tău.',
      'Dacă nu ai această carte, suntem bucuroși să ți-o oferim complet gratuit.',
      'Poți citi împreună cu copilul direct în liniștea casei tale.',
    ],
    closing: 'Dă-i o șansă copilului tău să-L cunoască pe Dumnezeu prin Cuvântul Său.',
    formEyebrow: 'Comandă cartea',
    formTitle: 'Primește gratuit „Mesajul lui Dumnezeu pentru tine”',
  },
]

export const bookBySlug = (slug: string | undefined) => books.find((b) => b.slug === slug)

/** Old WordPress paths (/index.php/biblia/ …) → new ones, so shared links keep working. */
export const legacyPaths: Record<string, string> = {
  '1393-2': '/activitati-pentru-copii',
  'activitati-cu-copiii': '/activitati-pentru-copii',
  'carti-gratuite': '/carti-gratuite',
  anunturi: '/anunturi',
  contact: '/contact',
  ...Object.fromEntries(books.map((b) => [b.slug, `/carti-gratuite/${b.slug}`])),
}
