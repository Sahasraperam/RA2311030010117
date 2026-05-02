export type NotificationType = "Placement" | "Result" | "Event" | string;

export type ApiNotification = {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
};

export type PriorityNotification = ApiNotification & {
  priorityScore: number;
  rank: number;
};

const TYPE_WEIGHT: Record<string, number> = {
  placement: 3,
  result: 2,
  event: 1,
};

const parseTimestamp = (timestamp: string) => {
  const normalized = timestamp.includes("T") ? timestamp : timestamp.replace(" ", "T");
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getTypeWeight = (type: NotificationType) => {
  return TYPE_WEIGHT[type.toLowerCase()] ?? 0;
};

export const scoreNotification = (notification: ApiNotification) => {
  const typeWeight = getTypeWeight(notification.Type);
  const recencySeconds = Math.floor(parseTimestamp(notification.Timestamp) / 1000);

  return typeWeight * 1_000_000_000_000 + recencySeconds;
};

export const getTopPriorityNotifications = (
  notifications: ApiNotification[],
  limit = 10,
): PriorityNotification[] => {
  return [...notifications]
    .sort((a, b) => {
      const scoreDifference = scoreNotification(b) - scoreNotification(a);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return a.ID.localeCompare(b.ID);
    })
    .slice(0, limit)
    .map((notification, index) => ({
      ...notification,
      priorityScore: scoreNotification(notification),
      rank: index + 1,
    }));
};

export class PriorityInbox {
  private readonly limit: number;
  private readonly items = new Map<string, ApiNotification>();

  constructor(limit = 10) {
    this.limit = limit;
  }

  upsert(notification: ApiNotification) {
    this.items.set(notification.ID, notification);

    const ranked = getTopPriorityNotifications([...this.items.values()], this.limit);
    const keep = new Set(ranked.map((item) => item.ID));

    for (const id of this.items.keys()) {
      if (!keep.has(id)) {
        this.items.delete(id);
      }
    }

    return ranked;
  }

  values() {
    return getTopPriorityNotifications([...this.items.values()], this.limit);
  }
}
