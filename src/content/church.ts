/** The church's fixed facts. Page texts live in code; these are used on several pages. */
export const church = {
  name: 'Biserica Adventistă de Ziua a Șaptea',
  place: 'Speranța – Timișoara',
  address: 'Strada Crișan nr. 11, Timișoara 300367',
  addressShort: 'Strada Crișan nr. 11, Timișoara',
  email: 'speranta.azs.tm@gmail.com',
  pastor: { name: 'Pastor Andreeas Ungur', email: 'andreeasungur@adventist.ro' },
  youtube: 'https://www.youtube.com/@bisericasperantatm',
  facebook: 'https://www.facebook.com/bisericasperantatm',
  directions: 'https://maps.app.goo.gl/ZPxUabo3vfSYM3PF6',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2783.3527340304618!2d21.207735616272448!3d45.76412072140019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474567dec77b37a9%3A0xc18c85383937e35d!2zQmlzZXJpY2EgQWR2ZW50aXN0xIMgIlNwZXJhbsWjYSIgVGltacWfb2FyYQ!5e0!3m2!1sro!2sro!4v1670434363900!5m2!1sro!2sro',
  /** "Cine sunt adventiștii", the documentary on the home page. */
  documentaryVideoId: 'cEFF7NLLZBo',
  /** The old site's flyer, used until an admin uploads one. */
  legacyFlyerUrl: 'https://drive.google.com/file/d/1g2lNUwN8NrU86xI-JtTwublKtNlJe19Q/view?usp=sharing',
  /** Book pickup at the church (the children's books). */
  pickupHours: [
    { day: 'Marți', times: '19:30 – 21:00' },
    { day: 'Vineri', times: '20:00 – 21:30' },
    { day: 'Sâmbătă', times: '09:00 – 12:30 și 18:00 – 19:30' },
  ],
} as const
