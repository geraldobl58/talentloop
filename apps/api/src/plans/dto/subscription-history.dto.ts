export enum SubscriptionActionEnum {
  CREATED = 'CREATED',
  UPGRADED = 'UPGRADED',
  DOWNGRADED = 'DOWNGRADED',
  RENEWED = 'RENEWED',
  CANCELED = 'CANCELED',
  REACTIVATED = 'REACTIVATED',
  EXPIRED = 'EXPIRED',
}

export class SubscriptionHistoryEventDto {
  id: string;
  action: SubscriptionActionEnum;
  previousPlanName?: string;
  previousPlanPrice?: number;
  newPlanName?: string;
  newPlanPrice?: number;
  reason?: string;
  notes?: string;
  triggeredBy?: string;
  createdAt: string;
}

export class SubscriptionHistoryDto {
  currentStatus: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  currentPlan: string;
  currentPlanPrice: number;
  currentExpiresAt: string;
  startedAt: string;

  events: SubscriptionHistoryEventDto[];

  summary: {
    totalUpgrades: number;
    totalDowngrades: number;
    totalCancellations: number;
    daysSinceCreation: number;
    daysUntilExpiry?: number;
  };
}

export class PlanHistoryDetailDto {
  id: string;
  timestamp: string;
  action: string;
  previousPlan: string | null;
  currentPlan: string | null;
  description: string;
  reason?: string;
  triggeredBy?: string;
}
