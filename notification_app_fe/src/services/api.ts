import axios from "axios";
import { Log } from "@/logging_middleware/logger";
import type { PriorityNotification } from "@/utils/priorityNotifications";

export type NotificationsResponse = {
  notifications: PriorityNotification[];
  source: "api" | "mock";
};

export const fetchNotifications = async (token: string): Promise<NotificationsResponse> => {
  try {
    await Log({
      stack: "frontend",
      level: "info",
      package: "api",
      message: "Fetching notifications",
    });

    const res = await axios.get("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data as NotificationsResponse;
  } catch (err) {
    await Log({
      stack: "frontend",
      level: "error",
      package: "api",
      message: "Failed to fetch notifications",
    });
    throw err;
  }
};
