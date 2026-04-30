"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const type_graphql_1 = require("type-graphql");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const apollo_server_core_1 = require("apollo-server-core");
const resolvers_1 = require("./resolvers");
const mongo_1 = require("./utils/mongo");
const jwt_1 = require("./utils/jwt");
const authChecker_1 = __importDefault(require("./utils/authChecker"));
const logger_1 = require("./utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const whitelist = [
    "https://www.nzfss.org.nz",
    "https://nzfss.org.nz",
    "https://nzfss-three.vercel.app",
    "https://nzfss-client.vercel.app"
];
if (process.env.CLIENT_SIDE_URL) {
    whitelist.push(process.env.CLIENT_SIDE_URL);
}
if (process.env.APP_URL) {
    whitelist.push(process.env.APP_URL);
}
if (process.env.NODE_ENV !== "production") {
    whitelist.push("http://localhost:3000");
    whitelist.push("http://127.0.0.1:3000");
}
const corsOptionsDelegate = (req, callback) => {
    const origin = req.headers.origin;
    console.log(`CORS Request - Origin: ${origin}, Method: ${req.method}, Path: ${req.path}`);
    if (!origin) {
        console.log("CORS: No origin header, allowing request");
        return callback(null, {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
            exposedHeaders: ['Set-Cookie']
        });
    }
    const isWhitelisted = whitelist.some(domain => {
        try {
            if (origin === domain) {
                return true;
            }
            const originUrl = new URL(origin);
            const domainUrl = new URL(domain);
            const matches = originUrl.protocol === domainUrl.protocol &&
                originUrl.host === domainUrl.host;
            if (matches) {
                console.log(`CORS: Origin ${origin} matches domain ${domain}`);
            }
            return matches;
        }
        catch (error) {
            const fallbackMatch = origin === domain || origin.startsWith(domain);
            if (fallbackMatch) {
                console.log(`CORS: Origin ${origin} matches domain ${domain} (fallback)`);
            }
            return fallbackMatch;
        }
    });
    if (isWhitelisted) {
        console.log(`CORS: Allowing origin ${origin}`);
        return callback(null, {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
            exposedHeaders: ['Set-Cookie']
        });
    }
    console.warn(`CORS: Rejected origin: ${origin}`);
    console.warn(`CORS: Whitelist: ${JSON.stringify(whitelist, null, 2)}`);
    console.warn(`CORS: Request headers: ${JSON.stringify(req.headers, null, 2)}`);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`), { origin: false });
};
async function bootstrap() {
    try {
        await (0, mongo_1.connectToMongo)();
        logger_1.logger.info('MongoDB connected successfully');
        try {
            const db = mongoose_1.default.connection.db;
            await db.admin().ping();
            logger_1.logger.info("Database ping successful");
        }
        catch (pingError) {
            logger_1.logger.warn("Database ping failed, but continuing:", pingError);
        }
        const schema = await (0, type_graphql_1.buildSchema)({
            resolvers: resolvers_1.resolvers,
            authChecker: authChecker_1.default,
            emitSchemaFile: true,
        });
        const app = (0, express_1.default)();
        app.use(express_1.default.urlencoded({ limit: "1000mb", extended: true }));
        app.use(express_1.default.json({ limit: "1000mb" }));
        app.use((0, cookie_parser_1.default)());
        app.options('*', (req, res) => {
            const origin = req.headers.origin;
            console.log(`OPTIONS preflight request from origin: ${origin}`);
            const isWhitelisted = !origin || whitelist.some(domain => {
                try {
                    if (origin === domain)
                        return true;
                    const originUrl = new URL(origin);
                    const domainUrl = new URL(domain);
                    return originUrl.protocol === domainUrl.protocol && originUrl.host === domainUrl.host;
                }
                catch {
                    return origin === domain || origin.startsWith(domain);
                }
            });
            if (isWhitelisted) {
                res.header('Access-Control-Allow-Origin', origin || '*');
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
                res.header('Access-Control-Expose-Headers', 'Set-Cookie');
                res.header('Access-Control-Max-Age', '86400');
                console.log(`OPTIONS: Allowing preflight for origin: ${origin}`);
                return res.status(200).end();
            }
            else {
                console.warn(`OPTIONS: Rejecting preflight for origin: ${origin}`);
                return res.status(403).end();
            }
        });
        app.use((0, cors_1.default)(corsOptionsDelegate));
        const server = new apollo_server_express_1.ApolloServer({
            schema,
            context: (ctx) => {
                const context = ctx;
                try {
                    const recentLogout = ctx.req.cookies?.logout === '1';
                    if (recentLogout) {
                        if (ctx.req.cookies?.accessToken) {
                            ctx.res.clearCookie('accessToken');
                        }
                        if (ctx.req.cookies?.authToken) {
                            ctx.res.clearCookie('authToken');
                        }
                    }
                    if (!recentLogout && ctx.req.cookies?.accessToken) {
                        const user = (0, jwt_1.verifyJwt)(ctx.req.cookies.accessToken);
                        if (user) {
                            context.user = user;
                        }
                    }
                    if (!context.user && ctx.req.headers.authorization) {
                        const token = ctx.req.headers.authorization.replace('Bearer ', '');
                        const user = (0, jwt_1.verifyJwt)(token);
                        if (user) {
                            context.user = user;
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.warn('Token verification failed:', error);
                    if (ctx.req.cookies?.accessToken) {
                        ctx.res.clearCookie("accessToken");
                    }
                }
                return context;
            },
            plugins: [
                process.env.NODE_ENV === "production"
                    ? (0, apollo_server_core_1.ApolloServerPluginLandingPageProductionDefault)()
                    : (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
                {
                    async serverWillStart() {
                        logger_1.logger.info('Server starting up!');
                    },
                    async requestDidStart() {
                        return {
                            async didEncounterErrors(requestContext) {
                                if (requestContext.errors) {
                                    requestContext.errors.forEach(error => {
                                        logger_1.logger.error('GraphQL Error:', {
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
                    logger_1.logger.error('GraphQL Error:', error);
                    return {
                        message: 'Internal server error',
                        path: error.path
                    };
                }
                return error;
            }
        });
        await server.start();
        server.applyMiddleware({
            app,
            cors: false,
            path: "/graphql",
        });
        app.get("/health", async (_req, res) => {
            try {
                const healthcheck = {
                    uptime: process.uptime(),
                    message: 'OK',
                    timestamp: Date.now(),
                    mongodb: {
                        status: mongoose_1.default.connection.readyState === 1 ? 'OK' : 'ERROR',
                        connected: mongoose_1.default.connection.readyState === 1,
                        state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose_1.default.connection.readyState]
                    },
                    memory: {
                        heapUsed: process.memoryUsage().heapUsed,
                        heapTotal: process.memoryUsage().heapTotal,
                        rss: process.memoryUsage().rss
                    }
                };
                res.status(200).send(healthcheck);
            }
            catch (error) {
                logger_1.logger.error('Health check failed:', error);
                res.status(503).send({
                    status: 'error',
                    message: 'Service unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        app.get("/", (_req, res) => {
            res.status(200).send("Server running");
        });
        app.post('/logout', (req, res) => {
            const base = {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            };
            res.clearCookie('accessToken');
            res.clearCookie('accessToken', base);
            res.clearCookie('authToken');
            res.clearCookie('authToken', base);
            res.clearCookie('userRole');
            res.clearCookie('userRole', base);
            res.cookie('logout', '1', { ...base, httpOnly: false, maxAge: 5 * 60 * 1000 });
            res.status(204).end();
        });
        app.use((err, _req, res, _next) => {
            logger_1.logger.error('Unhandled error:', err);
            res.status(500).json({
                status: 'error',
                message: process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : err.message
            });
        });
        process.on('unhandledRejection', (reason) => {
            logger_1.logger.error('Unhandled Rejection:', reason);
        });
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught Exception:', error);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });
        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            logger_1.logger.info(`Server is running on port ${port}`);
            logger_1.logger.info(`GraphQL endpoint: http://localhost:${port}${server.graphqlPath}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    logger_1.logger.error('Server startup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map