"use client";

import { useEffect, useMemo, useState } from "react";
import NotificationCard from "../components/NotificationCard";
import { Log } from "@/logging_middleware/logger";
import { fetchNotifications } from "../services/api";
import { getToken, registerUser, type AuthPayload, type RegisterPayload } from "../services/auth";
import type { PriorityNotification } from "@/utils/priorityNotifications";

type Toast = {
  type: "success" | "error" | "info";
  message: string;
};


const initialAuth: AuthPayload = {
  name: "",
  email: "",
  rollNo: "",
  accessCode: "",
  clientID: "",
  clientSecret: "",
};

const initialRegister: RegisterPayload = {
  name: "",
  email: "",
  rollNo: "",
  accessCode: "",
  githubUsername: "",
};

export default function Home() {
  const [authPayload, setAuthPayload] = useState<AuthPayload>(initialAuth);
  const [registerPayload, setRegisterPayload] = useState<RegisterPayload>(initialRegister);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PriorityNotification[]>([]);
  const [dataSource, setDataSource] = useState<"api" | "mock" | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Log({
      stack: "frontend",
      level: "info",
      package: "page",
      message: "Home page loaded",
    });

    const stored = localStorage.getItem("notification_token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      Log({
        stack: "frontend",
        level: "debug",
        package: "state",
        message: "Token state updated",
      });
    }
  }, [token]);

  useEffect(() => {
    Log({
      stack: "frontend",
      level: "debug",
      package: "state",
      message: `Notifications state updated: ${notifications.length} items`,
    });
  }, [notifications]);

  const canAuth = useMemo(() => {
    return Object.values(authPayload).every((value) => value.trim().length > 0);
  }, [authPayload]);

  const updateAuth = (key: keyof AuthPayload, value: string) => {
    setAuthPayload((current) => ({ ...current, [key]: value }));
  };

  const updateRegister = (key: keyof RegisterPayload, value: string) => {
    setRegisterPayload((current) => ({ ...current, [key]: value }));
  };

  const canRegister = useMemo(() => {
    return Object.values(registerPayload).every((value) => value.trim().length > 0);
  }, [registerPayload]);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    await Log({
      stack: "frontend",
      level: "info",
      package: "auth",
      message: "Auth button clicked",
    });

    try {
      const accessToken = await getToken(authPayload);
      localStorage.setItem("notification_token", accessToken);
      setToken(accessToken);
      setToast({ type: "success", message: "Token saved. You can load notifications." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch token. Check credentials.");
      setToast({ type: "error", message: "Auth failed" });
      await Log({
        stack: "frontend",
        level: "error",
        package: "auth",
        message: "Auth failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    await Log({
      stack: "frontend",
      level: "info",
      package: "auth",
      message: "Register button clicked",
    });

    try {
      const creds = await registerUser(registerPayload);
      setAuthPayload((current) => ({
        ...current,
        name: registerPayload.name,
        email: registerPayload.email,
        rollNo: registerPayload.rollNo,
        accessCode: registerPayload.accessCode,
        clientID: creds.clientID,
        clientSecret: creds.clientSecret,
      }));
      setToast({ type: "success", message: "Registered. Client credentials filled in." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setToast({ type: "error", message: "Registration failed" });
      await Log({
        stack: "frontend",
        level: "error",
        package: "auth",
        message: "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    await Log({
      stack: "frontend",
      level: "info",
      package: "component",
      message: "Load notifications clicked",
    });

    try {
      const data = await fetchNotifications(token ?? "demo-token");
      setNotifications(data.notifications);
      setDataSource(data.source);
      setToast({
        type: data.source === "api" ? "success" : "info",
        message:
          data.source === "api"
            ? "Priority inbox loaded"
            : "Loaded Notification inbox",
      });
    } catch (err) {
      setError("Unable to fetch notifications");
      setToast({ type: "error", message: "Fetch failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="hero__eyebrow"></p>
          <h1>Notification Inbox</h1>
          <p className="hero__subtitle">
            
          </p>
        </div>
        <div className="hero__stats">
          <div>
            <span className="label">Token</span>
            <strong>{token ? "Ready" : "Missing"}</strong>
          </div>
          <div>
            <span className="label">Top Items</span>
            <strong>{notifications.length}</strong>
          </div>
          <div>
            <span className="label">Source</span>
            <strong>{dataSource ?? "Idle"}</strong>
          </div>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Step 1: Register</h2>
          <p className="panel__hint">
            Register once to obtain your client credentials. Use your college email, roll number,
            access code, and GitHub username.
          </p>
          <div className="form">
            <label>
              Name
              <input
                value={registerPayload.name}
                onChange={(event) => updateRegister("name", event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={registerPayload.email}
                onChange={(event) => updateRegister("email", event.target.value)}
                placeholder="you@college.edu"
              />
            </label>
            <label>
              Roll No
              <input
                value={registerPayload.rollNo}
                onChange={(event) => updateRegister("rollNo", event.target.value)}
                placeholder="Your roll number"
              />
            </label>
            <label>
              Access Code
              <input
                value={registerPayload.accessCode}
                onChange={(event) => updateRegister("accessCode", event.target.value)}
                placeholder="Provided access code"
              />
            </label>
            <label>
              GitHub Username
              <input
                value={registerPayload.githubUsername}
                onChange={(event) => updateRegister("githubUsername", event.target.value)}
                placeholder="github-username"
              />
            </label>
          </div>
          <button className="btn" onClick={handleRegister} disabled={!canRegister || loading}>
            {loading ? "Working..." : "Register"}
          </button>
        </div>

        <div className="panel">
          <h2>Step 2: Get Token</h2>
          <p className="panel__hint">Enter your auth details. Tokens are stored locally.</p>
          <div className="form">
            <label>
              Name
              <input
                value={authPayload.name}
                onChange={(event) => updateAuth("name", event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={authPayload.email}
                onChange={(event) => updateAuth("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Roll No
              <input
                value={authPayload.rollNo}
                onChange={(event) => updateAuth("rollNo", event.target.value)}
                placeholder="Your roll number"
              />
            </label>
            <label>
              Access Code
              <input
                value={authPayload.accessCode}
                onChange={(event) => updateAuth("accessCode", event.target.value)}
                placeholder="Provided access code"
              />
            </label>
            <label>
              Client ID
              <input
                value={authPayload.clientID}
                onChange={(event) => updateAuth("clientID", event.target.value)}
                placeholder="client-id"
              />
            </label>
            <label>
              Client Secret
              <input
                type="password"
                value={authPayload.clientSecret}
                onChange={(event) => updateAuth("clientSecret", event.target.value)}
                placeholder="client-secret"
              />
            </label>
          </div>
          <button className="btn" onClick={handleAuth} disabled={!canAuth || loading}>
            {loading ? "Working..." : "Get Token"}
          </button>
        </div>

        <div className="panel">
          <h2>Step 3: Notifications</h2>
          <p className="panel__hint">
          </p>
          <button className="btn btn--ghost" onClick={handleFetch} disabled={loading}>
            {loading ? "Loading..." : "Notification Inbox"}
          </button>

          {error ? <p className="state state--error">{error}</p> : null}

          <div className="list">
            {notifications.length === 0 ? (
              <p className="state">No notifications loaded yet.</p>
            ) : (
              notifications.map((item) => (
                <NotificationCard key={item.ID} {...item} />
              ))
            )}
          </div>
        </div>
      </section>

      {toast ? (
        <div className={`toast toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
