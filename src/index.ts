import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import cors, { CorsOptions } from "cors";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";
import { resolvers } from "./resolvers";
import { connectToMongo } from "./utils/mongo";
import { verifyJwt } from "./utils/jwt";
import { User } from "./schema/user.schema";
import Context from "./types/context";
import authChecker from "./utils/authChecker";
import { logger } from "./utils/logger";
import mongoose from "mongoose";

// Build a whitelist array from environment variables.
const whitelist: string[] = [
  "https://www.nzfss.org.nz",
  "https://nzfss.org.nz",
  "https://nzfss-three.vercel.app",
  "https://nzfss-client.vercel.app"
];

// Add environment-specific URLs
if (process.env.CLIENT_SIDE_URL) {
  whitelist.push(process.env.CLIENT_SIDE_URL);
}
if (process.env.APP_URL) {
  whitelist.push(process.env.APP_URL);
}

// Add common development URLs
if (process.env.NODE_ENV !== "production") {
  whitelist.push("http://localhost:3000");
  whitelist.push("http://127.0.0.1:3000");
}

/**
 * Dynamic CORS configuration delegate function.
 * It allows requests if the request's origin is in the whitelist or if no origin is provided.
 *
 * @param req - The incoming Express request (used to extract the origin).
 * @param callback - Callback to pass an error (if any) and the CORS options.
 */
const corsOptionsDelegate = (
  req: Request,
  callback: (err: Error | null, options?: CorsOptions) => void
): void => {
  // Extract the origin from the request headers
  const origin = req.headers.origin;
  
  // Log all CORS requests for debugging
  console.log(`CORS Request - Origin: ${origin}, Method: ${req.method}, Path: ${req.path}`);
  
  if (!origin) {
    // Allow requests with no origin (like from Postman or non-browser clients)
    console.log("CORS: No origin header, allowing request");
    return callback(null, { 
      origin: true, 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Set-Cookie']
    });
  }

  // Check if the origin matches any of our whitelisted domains
  const isWhitelisted = whitelist.some(domain => {
    try {
      // Direct string match first
      if (origin === domain) {
        return true;
      }
      
      // URL-based comparison for more robust matching
      const originUrl = new URL(origin);
      const domainUrl = new URL(domain);
      
      // Check if the protocol and host match exactly
      const matches = originUrl.protocol === domainUrl.protocol && 
                     originUrl.host === domainUrl.host;
      
      if (matches) {
        console.log(`CORS: Origin ${origin} matches domain ${domain}`);
      }
      
      return matches;
    } catch (error) {
      // Fallback to string comparison if URL parsing fails
      const fallbackMatch = origin === domain || origin.startsWith(domain);
      if (fallbackMatch) {
        console.log(`CORS: Origin ${origin} matches domain ${domain} (fallback)`);
      }
      return fallbackMatch;
    }
  });

  if (isWhitelisted) {
    console.log(`CORS: Allowing origin ${origin}`);
    // Allow requests with origins present in the whitelist
    return callback(null, { 
      origin: true, 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Set-Cookie']
    });
  }

  // Log rejected origins for debugging
  console.warn(`CORS: Rejected origin: ${origin}`);
  console.warn(`CORS: Whitelist: ${JSON.stringify(whitelist, null, 2)}`);
  console.warn(`CORS: Request headers: ${JSON.stringify(req.headers, null, 2)}`);

  // Reject all other requests by returning an error.
  return callback(new Error(`Not allowed by CORS. Origin: ${origin}`), { origin: false });
};

async function bootstrap() {
  try {
    // Connect to MongoDB first, before starting the server
    await connectToMongo();
    logger.info('MongoDB connected successfully');
    
    // Test database connection
    try {
      const db = mongoose.connection.db;
      await db.admin().ping();
      logger.info("Database ping successful");
    } catch (pingError) {
      logger.warn("Database ping failed, but continuing:", pingError);
    }

    // Build the GraphQL schema using type-graphql.
    const schema = await buildSchema({
      resolvers,
      authChecker,
      emitSchemaFile: true,
    });

    // Initialize the Express application
    const app: Application = express();

    // Use middleware to parse URL-encoded and JSON bodies.
    app.use(express.urlencoded({ limit: "1000mb", extended: true }));
    app.use(express.json({ limit: "1000mb" }));
    app.use(cookieParser());

    // Handle preflight OPTIONS requests explicitly
    app.options('*', (req: Request, res: Response) => {
      const origin = req.headers.origin;
      console.log(`OPTIONS preflight request from origin: ${origin}`);
      
      // Check if origin is whitelisted
      const isWhitelisted = !origin || whitelist.some(domain => {
        try {
          if (origin === domain) return true;
          const originUrl = new URL(origin);
          const domainUrl = new URL(domain);
          return originUrl.protocol === domainUrl.protocol && originUrl.host === domainUrl.host;
        } catch {
          return origin === domain || origin.startsWith(domain);
        }
      });

      if (isWhitelisted) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        res.header('Access-Control-Expose-Headers', 'Set-Cookie');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        console.log(`OPTIONS: Allowing preflight for origin: ${origin}`);
        return res.status(200).end();
      } else {
        console.warn(`OPTIONS: Rejecting preflight for origin: ${origin}`);
        return res.status(403).end();
      }
    });

    // Apply the dynamic CORS configuration
    app.use(cors(corsOptionsDelegate));

    // Create the Apollo Server with error handling
    const server = new ApolloServer({
      schema,
      context: (ctx: Context): Context => {
        const context: Context = ctx;
        
        try {
          // Determine if we should ignore cookie-based auth due to recent logout
          const recentLogout = ctx.req.cookies?.logout === '1';

          // If logout flag exists, clear any residual cookie tokens but DO NOT return early.
          // Still allow Authorization header to authenticate a fresh login.
          if (recentLogout) {
            if (ctx.req.cookies?.accessToken) {
              ctx.res.clearCookie('accessToken');
            }
            if (ctx.req.cookies?.authToken) {
              ctx.res.clearCookie('authToken');
            }
          }

          // First check cookies for the access token (only when not in recent logout window)
          if (!recentLogout && ctx.req.cookies?.accessToken) {
            const user = verifyJwt<User>(ctx.req.cookies.accessToken);
            if (user) {
              context.user = user;
            }
          }

          // Always allow Authorization header fallback regardless of logout flag
          if (!context.user && ctx.req.headers.authorization) {
            const token = ctx.req.headers.authorization.replace('Bearer ', '');
            const user = verifyJwt<User>(token);
            if (user) {
              context.user = user;
            }
          }
        } catch (error) {
          logger.warn('Token verification failed:', error);
          if (ctx.req.cookies?.accessToken) {
            ctx.res.clearCookie("accessToken");
          }
        }
        
        return context;
      },
      plugins: [
        process.env.NODE_ENV === "production"
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageGraphQLPlayground(),
        // Add error reporting plugin
        {
          async serverWillStart() {
            logger.info('Server starting up!');
          },
          async requestDidStart() {
            return {
              async didEncounterErrors(requestContext) {
                if (requestContext.errors) {
                  requestContext.errors.forEach(error => {
                    logger.error('GraphQL Error:', {
                      error: error.message,
                      path: error.path,
                      extensions: error.extensions,
                      stack: error.stack
                    });
                  });
                }
              }
            };
          }
        }
      ],
      formatError: (error) => {
        // Allow specific authentication errors to be sent to the client
        const allowedMessages = [
          'Invalid email or password',
          'No account found with this email address.',
          'Your account is currently locked or disabled. Please contact support.',
          'Too many login attempts. Please wait a few minutes before trying again.'
        ];
        if (process.env.NODE_ENV === 'production') {
          if (allowedMessages.includes(error.message)) {
            return {
              message: error.message,
              path: error.path,
              extensions: error.extensions
            };
          }
          logger.error('GraphQL Error:', error);
          return {
            message: 'Internal server error',
            path: error.path
          };
        }
        return error;
      }
    });

    // Start Apollo Server
    await server.start();

    // Integrate Apollo middleware with Express
    server.applyMiddleware({
      app,
      cors: false,
      path: "/graphql",
    });

    // Enhanced health check route with more detailed status
    app.get("/health", async (_req: Request, res: Response) => {
      try {
        const healthcheck = {
          uptime: process.uptime(),
          message: 'OK',
          timestamp: Date.now(),
          mongodb: {
            status: mongoose.connection.readyState === 1 ? 'OK' : 'ERROR',
            connected: mongoose.connection.readyState === 1,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
          },
          memory: {
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal,
            rss: process.memoryUsage().rss
          }
        };
        res.status(200).send(healthcheck);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).send({
          status: 'error',
          message: 'Service unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Keep the existing root endpoint
    app.get("/", (_req: Request, res: Response) => {
      res.status(200).send("Server running");
    });

    // Direct logout endpoint for robust cookie clearing (used by sendBeacon)
    app.post('/logout', (req: Request, res: Response) => {
      const base = {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
      };
      // Clear all auth cookies
      res.clearCookie('accessToken');
      res.clearCookie('accessToken', base);
      res.clearCookie('authToken');
      res.clearCookie('authToken', base);
      res.clearCookie('userRole');
      res.clearCookie('userRole', base);
      // Set a temporary logout flag to prevent cookie-based re-auth
      res.cookie('logout', '1', { ...base, httpOnly: false, maxAge: 5 * 60 * 1000 });
      res.status(204).end();
    });

    // Error handling middleware
    app.use((err: Error, _req: Request, res: Response, _next: Function) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message
      });
    });

    // Global error handlers
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      // Give the logger time to write before exiting
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    // Start the server only after everything is set up
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`GraphQL endpoint: http://localhost:${port}${server.graphqlPath}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Bootstrap the server
bootstrap().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});
