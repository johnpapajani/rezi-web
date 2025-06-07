import { BusinessFeature, Testimonial, PricingPlan, FAQ } from '../types';

export const features: BusinessFeature[] = [
  {
    id: 1,
    icon: 'QrCodeIcon',
    title: 'features.online.title',
    description: 'features.online.description',
  },
  {
    id: 2,
    icon: 'CalendarDaysIcon',
    title: 'features.calendar.title',
    description: 'features.calendar.description',
  },
  {
    id: 3,
    icon: 'BellIcon',
    title: 'features.notifications.title',
    description: 'features.notifications.description',
  },
  {
    id: 4,
    icon: 'ChartBarIcon',
    title: 'features.analytics.title',
    description: 'features.analytics.description',
  },
  {
    id: 5,
    icon: 'LanguageIcon',
    title: 'features.multilingual.title',
    description: 'features.multilingual.description',
  },
  {
    id: 6,
    icon: 'DevicePhoneMobileIcon',
    title: 'features.mobile.title',
    description: 'features.mobile.description',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Ardit Krasniqi',
    business: 'Restaurant "Të Shtënat"',
    avatar: '/avatars/ardit.jpg',
    rating: 5,
    content: 'Rezi na ka ndihmuar të organizojmë rezervimet në mënyrë profesionale. Klientët tanë janë shumë të kënaqur me sistemin e ri.',
  },
  {
    id: 2,
    name: 'Elona Hoxha',
    business: 'Salon "Eleganca"',
    avatar: '/avatars/elona.jpg',
    rating: 5,
    content: 'Aplikacioni është shumë i lehtë për tu përdorur. Tani klientët e mi mund të rezervojnë online dhe unë mund ta menaxhoj gjithçka nga telefoni.',
  },
  {
    id: 3,
    name: 'Driton Berisha',
    business: 'Hotel "Rilindja"',
    avatar: '/avatars/driton.jpg',
    rating: 5,
    content: 'Sistemi i rezervimeve të Rezi është i shkëlqyer. Na ka kursyer shumë kohë dhe ka rritur efikasitetin e hotelit tonë.',
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: 'pricing.free.name',
    price: '0',
    period: 'pricing.monthly',
    description: 'pricing.free.description',
    features: [
      'Deri në 50 rezervime në muaj',
      'Kalendar bazik',
      'Mbështetje email',
      'Kod QR',
    ],
    cta: 'pricing.cta',
  },
  {
    id: 2,
    name: 'pricing.pro.name',
    price: '1500',
    period: 'pricing.monthly',
    description: 'pricing.pro.description',
    features: [
      'Rezervime të pafundme',
      'Kalendar i avancuar',
      'SMS dhe email automatike',
      'Analiza të detajuara',
      'Mbështetje prioritare',
      'Personalizim i plotë',
    ],
    popular: true,
    cta: 'pricing.cta',
  },
  {
    id: 3,
    name: 'pricing.enterprise.name',
    price: 'Kontaktoni',
    period: '',
    description: 'pricing.enterprise.description',
    features: [
      'Të gjitha veçoritë e Pro',
      'API i plotë',
      'Integrimi me sisteme të tjera',
      'Trajnim i personelit',
      'Mbështetje 24/7',
      'Menaxher i dedikuar',
    ],
    cta: 'Kontaktoni',
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: 'Si mund të filloj të përdor Rezi?',
    answer: 'Thjesht regjistrohuni falas në platformën tonë, konfiguroni biznezin tuaj dhe filloni të merrni rezervime menjëherë.',
  },
  {
    id: 2,
    question: 'A ka kosto të fshehta?',
    answer: 'Jo, të gjitha çmimet janë transparente. Nuk ka tarifa të fshehta ose kosto shtesë.',
  },
  {
    id: 3,
    question: 'A mund ta përdor në telefon?',
    answer: 'Po, Rezi punon përsosisht në të gjitha pajisjet - telefon, tablet dhe kompjuter.',
  },
  {
    id: 4,
    question: 'Si funksionon sistemi i njoftimeve?',
    answer: 'Sistemi dërgon automatikisht SMS dhe email tek klientët për konfirmimin e rezervimit, rikujtime dhe ndryshime.',
  },
  {
    id: 5,
    question: 'A mund të personalizoj faqen e rezervimit?',
    answer: 'Po, mund të personalizoni plotësisht faqen e rezervimit me logon, ngjyrat dhe informacionet e biznesit tuaj.',
  },
]; 