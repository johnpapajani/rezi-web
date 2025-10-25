/**
 * Feature Flags Configuration
 * 
 * This file controls feature rollouts across the application.
 * Set a flag to false to disable a feature and rollback to the previous version.
 */

export const featureFlags = {
  /**
   * New Pricing Model (Solo + Team)
   * 
   * When true: Shows new 2-plan pricing (Solo €12, Team €24) with add-ons
   * When false: Reverts to old pricing model
   * 
   * To rollback: Set to false and redeploy
   */
  enableNewPricing: true,
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature];
};

