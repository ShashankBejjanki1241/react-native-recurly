/**
 * Explicit exports for home components (easier “go to type” than ambient globals).
 * Relies on global `Subscription` from `type.d.ts`.
 */
export type HomeSubscriptionCardProps = {
  subscription: Subscription;
  expanded: boolean;
  onPress: () => void;
  onCancelPress?: () => void;
  isCancelling?: boolean;
};
