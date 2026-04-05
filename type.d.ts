import type { ImageSourcePropType } from "react-native";

declare global {
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    renewalDate?: string;
    color?: string;
  }

  /** Props for `HomeSubscriptionCard`. */
  interface HomeSubscriptionCardProps {
    subscription: Subscription;
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
    /** ISO 8601 — used with dayjs for renewal line; optional if only `daysLeft` is shown. */
    renewalDate?: string;
  }

  /** Props for `UpcomingSubscriptionCard` — map each `UpcomingSubscription` row to `data` (omit `id`). */
  interface UpcomingSubscriptionCardData {
    name: string;
    price: number;
    daysLeft: number;
    icon: ImageSourcePropType;
    currency?: string;
  }

  interface UpcomingSubscriptionCardProps {
    data: UpcomingSubscriptionCardData;
  }

  interface ListHeadingProps {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
  }
}

export { };

