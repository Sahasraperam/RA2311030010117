import axios from "axios";

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

type LogParams = {
  stack: "frontend";
  level: "debug" | "info" | "warn" | "error" | "fatal";
  package:
    | "component"
    | "hook"
    | "api"
    | "page"
    | "state"
    | "style"
    | "auth"
    | "config"
    | "middleware"
    | "utils";
  message: string;
};

export const Log = async ({ stack, level, package: pkg, message }: LogParams) => {
  try {
    await axios.post(LOG_API, {
      stack,
      level,
      package: pkg,
      message,
    });
  } catch (err) {
    console.error("Logging failed", err);
  }
};
