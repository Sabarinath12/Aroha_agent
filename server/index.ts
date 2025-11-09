import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy (required for proper IP detection behind load balancers and Replit infrastructure)
// Replit always runs behind a proxy, so we need this in all environments
app.set('trust proxy', 1);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Security: Add security headers to all responses
app.use((req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS in production (when behind a proxy)
  if (app.get('env') === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Control which features and APIs can be used
  res.setHeader('Permissions-Policy', 'microphone=*, camera=(), geolocation=()');
  
  next();
});

// Security: CORS protection - only allow same origin by default
// This prevents unauthorized external sites from making requests to your API
app.use((req, res, next) => {
  const origin = req.get('origin');
  const host = req.get('host');
  
  // Validate origin matches host exactly (prevent subdomain/superdomain attacks)
  let isAllowedOrigin = false;
  
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      const expectedHost = host.split(':')[0]; // Remove port if present
      const originHost = originUrl.hostname;
      
      // Exact match: origin hostname must exactly match the host
      // This prevents attacks like origin='evil.com.attacker.net' when host='evil.com'
      if (originHost === expectedHost) {
        isAllowedOrigin = true;
      }
    } catch (error) {
      // Invalid origin URL - reject
      console.warn(`[Security] Invalid origin URL: ${origin}`);
      isAllowedOrigin = false;
    }
  }
  
  // Set CORS headers only for allowed origins
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      return res.sendStatus(204);
    } else {
      // Reject preflight from unauthorized origins
      return res.sendStatus(403);
    }
  }
  
  next();
});

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
