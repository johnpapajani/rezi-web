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
    icon: 'LanguageIcon',
    title: 'features.multilingual.title',
    description: 'features.multilingual.description',
  },
  {
    id: 4,
    icon: 'ChartBarIcon',
    title: 'features.analytics.title',
    description: 'features.analytics.description',
  },
  {
    id: 5,
    icon: 'BellIcon',
    title: 'features.notifications.title',
    description: 'features.notifications.description',
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
    name: 'pricing.solo.name',
    price: '6.99',
    yearlyPrice: '59.99',
    period: 'pricing.monthly',
    description: 'pricing.solo.description',
    features: [
      'pricing.solo.feature1',
      'pricing.solo.feature2',
      'pricing.solo.feature3',
      'pricing.solo.feature4',
      'pricing.solo.feature5',
      'pricing.solo.feature6',
      'pricing.solo.feature7',
      'pricing.solo.feature8',
    ],
    cta: 'pricing.cta',
  },
  {
    id: 2,
    name: 'pricing.pro.name',
    price: '12.99',
    yearlyPrice: '119.99',
    period: 'pricing.monthly',
    description: 'pricing.pro.description',
    features: [
      'pricing.pro.feature1',
      'pricing.pro.feature2',
      'pricing.pro.feature3',
      'pricing.pro.feature4',
      'pricing.pro.feature5',
      'pricing.pro.feature6',
      'pricing.pro.feature7',
      'pricing.pro.feature8',
    ],
    popular: true,
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