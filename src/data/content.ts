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
    content: 'testimonials.content.ardit',
  },
  {
    id: 2,
    name: 'Elona Hoxha',
    business: 'Salon "Eleganca"',
    avatar: '/avatars/elona.jpg',
    rating: 5,
    content: 'testimonials.content.elona',
  },
  {
    id: 3,
    name: 'Driton Berisha',
    business: 'Hotel "Rilindja"',
    avatar: '/avatars/driton.jpg',
    rating: 5,
    content: 'testimonials.content.driton',
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
      'pricing.free.feature1',
      'pricing.free.feature2',
      'pricing.free.feature3',
    ],
    cta: 'pricing.cta',
  },
  {
    id: 2,
    name: 'pricing.starter.name',
    price: '4.99',
    yearlyPrice: '3.99',
    period: 'pricing.monthly',
    description: 'pricing.starter.description',
    features: [
      'pricing.starter.feature1',
      'pricing.starter.feature2',
      'pricing.starter.feature3',
      'pricing.starter.feature4',
    ],
    popular: true,
    cta: 'pricing.cta',
  },
  {
    id: 3,
    name: 'pricing.business.name',
    price: '9.99',
    yearlyPrice: '8.99',
    period: 'pricing.monthly',
    description: 'pricing.business.description',
    features: [
      'pricing.business.feature1',
      'pricing.business.feature2',
      'pricing.business.feature3',
      'pricing.business.feature4',
      'pricing.business.feature5',
      'pricing.business.feature6',
    ],
    cta: 'pricing.cta',
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: 'faq.questions.howToStart.question',
    answer: 'faq.questions.howToStart.answer',
  },
  {
    id: 2,
    question: 'faq.questions.hiddenCosts.question',
    answer: 'faq.questions.hiddenCosts.answer',
  },
  {
    id: 3,
    question: 'faq.questions.mobileUse.question',
    answer: 'faq.questions.mobileUse.answer',
  },
  {
    id: 4,
    question: 'faq.questions.notifications.question',
    answer: 'faq.questions.notifications.answer',
  },
]; 