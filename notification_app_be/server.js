const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;

const notifications = [];
const logs = [];

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function isNonEmptyString(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { success: true, data: { status: "ok" }, error: null });
    return;
  }

  if (req.method === "GET" && url.pathname === "/notifications") {
    const userId = url.searchParams.get("userId");
    const items = userId
      ? notifications.filter((item) => item.userId === userId)
      : notifications;
    sendJson(res, 200, { success: true, data: { items }, error: null });
    return;
  }

  if (req.method === "POST" && url.pathname === "/notifications") {
    try {
      const body = await readJson(req);
      if (!body || typeof body !== "object") {
        sendJson(res, 400, { success: false, data: null, error: "invalid JSON body" });
        return;
      }

      const { userId, title, message, channel, priority } = body;
      if (!isNonEmptyString(userId, 80) || !isNonEmptyString(title, 120) || !isNonEmptyString(message, 1000)) {
        sendJson(res, 400, { success: false, data: null, error: "missing or invalid fields" });
        return;
      }

      const notification = {
        id: `notif-${Date.now()}`,
        userId,
        title,
        message,
        channel: channel || "in_app",
        priority: priority || "normal",
        createdAt: new Date().toISOString(),
      };

      notifications.unshift(notification);
      sendJson(res, 201, { success: true, data: { notification }, error: null });
      return;
    } catch (error) {
      sendJson(res, 400, { success: false, data: null, error: "invalid JSON body" });
      return;
    }
  }

  if (req.method === "POST" && url.pathname === "/logs") {
    try {
      const body = await readJson(req);
      if (!body || typeof body !== "object") {
        sendJson(res, 400, { success: false, data: null, error: "invalid JSON body" });
        return;
      }

      logs.push({ ...body, receivedAt: new Date().toISOString() });
      sendJson(res, 200, { success: true, data: { stored: true }, error: null });
      return;
    } catch (error) {
      sendJson(res, 400, { success: false, data: null, error: "invalid JSON body" });
      return;
    }
  }

  sendJson(res, 404, { success: false, data: null, error: "not found" });
});

server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
