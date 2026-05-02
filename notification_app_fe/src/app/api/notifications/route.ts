import { NextResponse } from "next/server";
import { getTopPriorityNotifications, type ApiNotification } from "@/utils/priorityNotifications";

const NOTIFICATION_API = "http://20.207.122.201/evaluation-service/notifications";

const mockNotifications: ApiNotification[] = [
];

const isApiNotification = (value: unknown): value is ApiNotification => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.ID === "string" &&
    typeof item.Type === "string" &&
    typeof item.Message === "string" &&
    typeof item.Timestamp === "string"
  );
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  try {
    const response = await fetch(NOTIFICATION_API, {
      headers: authHeader ? { Authorization: authHeader } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Notification API failed with status ${response.status}`);
    }

    const data = (await response.json()) as { notifications?: unknown[] };
    const notifications = (data.notifications ?? []).filter(isApiNotification);

    return NextResponse.json({
      notifications: getTopPriorityNotifications(notifications),
      source: "api",
    });
  } catch {
    return NextResponse.json({
      notifications: getTopPriorityNotifications(mockNotifications),
      source: "mock",
    });
  }
}
