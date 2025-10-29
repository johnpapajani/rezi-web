# Pricing Feature Flag Documentation

## Overview

The new pricing model (Solo + Team) is controlled by a feature flag for easy rollback if needed.

## Current Pricing Model

### Plans
- **Solo** - €12/month (€120/year)
  - Online booking page & website widget
  - Basic calendar • Unlimited bookings
  - Email reminders
  - Basic analytics
  - Email support

- **Team** - €24/month (€240/year) [Most Popular]
  - Up to 5 staff & services
  - SMS reminders (usage billed)
  - Google Calendar sync
  - Revenue dashboard
  - Priority support (email + chat)

### Add-ons
- +€4/mo per extra staff
- +€5/mo per extra location
- SMS: €0.015 per message

### Business Plan
- Contact sales for enterprise features
- Unlimited staff, multi-location, roles & permissions, export/API, onboarding

### Billing
- Monthly vs Annual toggle
- Annual = 10× monthly price (2 months free)
- Example: Solo €12/mo or €120/year

## Feature Flag Configuration

The feature flag is located in: `src/utils/featureFlags.ts`

```typescript
export const featureFlags = {
  enableNewPricing: true,  // Set to false to rollback
} as const;
```

## How to Rollback

If you need to revert to the old pricing model:

1. Open `src/utils/featureFlags.ts`
2. Change `enableNewPricing: true` to `enableNewPricing: false`
3. Redeploy the application

The old pricing model will be automatically displayed with the previous plans:
- Standard Solo (€6.99/mo or €59.99/year)
- Standard Pro (€12.99/mo or €119.99/year)

## Internationalization

The pricing is fully translated in three languages:
- English (EN)
- Albanian (SQ)
- Italian (IT)

All translations are in `src/data/translations.ts` under the `pricing.*` keys.

## Testing the Feature Flag

To test the rollback:
1. Set `enableNewPricing: false` in `featureFlags.ts`
2. Visit the pricing section on the landing page
3. Verify old pricing is displayed
4. Set `enableNewPricing: true` to re-enable new pricing
5. Verify new pricing is displayed

## Files Modified

- `src/data/translations.ts` - Added new pricing translations for EN/SQ/IT
- `src/data/content.ts` - Updated pricing plan structure
- `src/components/sections/Pricing.tsx` - New pricing UI with fallback
- `src/utils/featureFlags.ts` - Feature flag configuration (NEW)

