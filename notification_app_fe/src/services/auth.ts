import axios from "axios";
import { Log } from "@/logging_middleware/logger";

const BASE_URL = "http://20.207.122.201/evaluation-service";

export type AuthPayload = {
  name: string;
  email: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  rollNo: string;
  accessCode: string;
  githubUsername: string;
};

export const getToken = async (data: AuthPayload) => {
  try {
    await Log({
      stack: "frontend",
      level: "info",
      package: "auth",
      message: "Requesting auth token",
    });
    const res = await axios.post(`${BASE_URL}/auth`, data);
    return res.data.access_token as string;
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? `Auth failed (${err.response?.status ?? "no status"}): ${
          (err.response?.data as { message?: string })?.message ?? "Check credentials or API availability"
        }`
      : "Auth failed: unexpected error";
    await Log({
      stack: "frontend",
      level: "error",
      package: "auth",
      message: "Auth token request failed",
    });
    throw new Error(message);
  }
};

export const registerUser = async (data: RegisterPayload) => {
  try {
    await Log({
      stack: "frontend",
      level: "info",
      package: "auth",
      message: "Registering user",
    });
    const res = await axios.post(`${BASE_URL}/register`, data);
    return res.data as { clientID: string; clientSecret: string };
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? `Registration failed (${err.response?.status ?? "no status"}): ${
          (err.response?.data as { message?: string })?.message ?? "Check registration fields"
        }`
      : "Registration failed: unexpected error";
    await Log({
      stack: "frontend",
      level: "error",
      package: "auth",
      message: "Registration failed",
    });
    throw new Error(message);
  }
};
