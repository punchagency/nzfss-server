"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const logger_1 = require("../utils/logger");
class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
        this.initializationPromise = null;
        this.config = this.validateAndGetConfig();
        if (this.config) {
            this.initializationPromise = this.initializeTransporter();
            this.initializationPromise.catch(error => {
                logger_1.logger.error('Failed to initialize email service:', error);
            });
        }
    }
    validateAndGetConfig() {
        const requiredEnvVars = {
            emailUser: process.env.EMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            redirectUri: process.env.GMAIL_REDIRECT_URI,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN
        };
        logger_1.logger.info('Email service environment variables:', {
            emailUser: requiredEnvVars.emailUser ? 'Set' : 'Not set',
            clientId: requiredEnvVars.clientId ? 'Set' : 'Not set',
            clientSecret: requiredEnvVars.clientSecret ? 'Set' : 'Not set',
            redirectUri: requiredEnvVars.redirectUri ? 'Set' : 'Not set',
            refreshToken: requiredEnvVars.refreshToken ? 'Set' : 'Not set'
        });
        const missingVars = Object.entries(requiredEnvVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);
        if (missingVars.length > 0) {
            logger_1.logger.warn('Email service configuration is incomplete. Missing environment variables:', missingVars.join(', '));
            return null;
        }
        return requiredEnvVars;
    }
    async initializeTransporter() {
        if (!this.config) {
            throw new Error('Email configuration is not valid');
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(this.config.clientId, this.config.clientSecret, this.config.redirectUri);
        oauth2Client.setCredentials({
            refresh_token: this.config.refreshToken
        });
        try {
            const accessToken = await oauth2Client.getAccessToken();
            this.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: this.config.emailUser,
                    clientId: this.config.clientId,
                    clientSecret: this.config.clientSecret,
                    refreshToken: this.config.refreshToken,
                    accessToken: accessToken.token || undefined,
                },
            });
            await this.transporter.verify();
            logger_1.logger.info('Email service initialized successfully');
        }
        catch (error) {
            this.transporter = null;
            logger_1.logger.error('Failed to initialize email transporter:', error);
            throw error;
        }
    }
    async ensureTransporter() {
        if (!this.transporter) {
            if (!this.initializationPromise) {
                this.initializationPromise = this.initializeTransporter();
            }
            await this.initializationPromise;
        }
        if (!this.transporter) {
            throw new Error('Email transporter failed to initialize');
        }
        return this.transporter;
    }
    async sendFormNotification(clubEmail, formDetails) {
        if (!clubEmail) {
            logger_1.logger.warn('No club email provided. Skipping form notification email.');
            return;
        }
        try {
            const transporter = await this.ensureTransporter();
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nzfss.org.nz';
            const loginUrl = `${baseUrl}/login`;
            await transporter.sendMail({
                from: {
                    name: 'NZFSS Registration System',
                    address: this.config?.emailUser || ''
                },
                to: clubEmail,
                subject: `New Musher Registration: ${formDetails.applicantName}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            </style>
          </head>
          <body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
            <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%);padding:32px 0 20px 0;text-align:center;border-radius:16px 16px 0 0;">
                <h1 style="color:#fff;margin:0;font-size:2rem;font-weight:700;">New Musher Registration</h1>
                <p style="color:#e0e7ef;margin:8px 0 0 0;font-size:1.1rem;">A new musher has joined the NZFSS community</p>
              </div>
              <!-- Main Content -->
              <div style="padding:32px 24px 16px 24px;">
                <!-- Registration Details -->
                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:20px 18px 18px 18px;margin-bottom:28px;background:#f9fafb;">
                  <div style="font-size:1.15rem;font-weight:600;color:#2563eb;margin-bottom:16px;">Registration Details</div>
                  <div style="background:#fff;border-radius:8px;padding:16px 18px 12px 18px;border:1px solid #f1f5f9;">
                    <div style="font-size:0.98rem;color:#64748b;margin-bottom:4px;">Musher Name</div>
                    <div style="font-size:1.08rem;color:#1e293b;font-weight:500;">${formDetails.applicantName}</div>
                  </div>
                  ${formDetails.email ? `
                  <div style="background:#fff;border-radius:8px;padding:16px 18px 12px 18px;border:1px solid #f1f5f9;margin-top:12px;">
                    <div style="font-size:0.98rem;color:#64748b;margin-bottom:4px;">Contact Email</div>
                    <div style="font-size:1.08rem;color:#1e293b;font-weight:500;">${formDetails.email}</div>
                  </div>
                  ` : ''}
                  ${formDetails.phone ? `
                  <div style="background:#fff;border-radius:8px;padding:16px 18px 12px 18px;border:1px solid #f1f5f9;margin-top:12px;">
                    <div style="font-size:0.98rem;color:#64748b;margin-bottom:4px;">Contact Phone</div>
                    <div style="font-size:1.08rem;color:#1e293b;font-weight:500;">${formDetails.phone}</div>
                  </div>
                  ` : ''}
                </div>
                <!-- Action Required -->
                <div style="background:#e0f2fe;border-radius:10px;padding:24px 18px 20px 18px;text-align:center;border:1px solid #bae6fd;margin-bottom:28px;">
                  <div style="color:#0369a1;font-weight:700;margin-bottom:10px;font-size:1.15rem;">Action Required</div>
                  <p style="color:#0c4a6e;margin:0 0 18px 0;line-height:1.5;font-size:1rem;">
                    Please log in to the NZFSS system to review and process this registration.
                  </p>
                  <a href="${loginUrl}"
                     style="display:inline-block;background:#2563eb;color:#fff;padding:12px 32px;text-decoration:none;border-radius:7px;font-weight:600;font-size:1rem;box-shadow:0 1px 2px rgba(30,64,175,0.08);transition:background 0.2s;">
                    Review Registration
                  </a>
                </div>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px 0;" />
                <div style="color:#64748b;font-size:0.98rem;text-align:center;margin-bottom:12px;">
                  This is an automated message from the NZFSS Registration System.<br />
                  Please do not reply to this email.
                </div>
                <div style="text-align:center;color:#94a3b8;font-size:0.93rem;margin-bottom:0;">
                  © ${new Date().getFullYear()} NZFSS. All rights reserved.
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
                headers: {
                    'X-Entity-Ref-ID': `musher-reg-${Date.now()}`,
                    'List-Unsubscribe': `<mailto:${this.config?.emailUser}?subject=Unsubscribe>`,
                    'Precedence': 'bulk'
                }
            });
            logger_1.logger.info(`Musher registration notification email sent to ${clubEmail}`);
        }
        catch (error) {
            logger_1.logger.error('Error sending musher registration notification email:', error);
            throw error;
        }
    }
    async sendGenericNotification(to, subject, message) {
        if (!to)
            return;
        try {
            const transporter = await this.ensureTransporter();
            await transporter.sendMail({
                from: {
                    name: 'NZFSS Notification',
                    address: this.config?.emailUser || ''
                },
                to,
                subject,
                html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
            <h2 style="color: #2563eb; margin-bottom: 18px;">${subject}</h2>
            <div style="color: #1e293b; font-size: 1.08rem; margin-bottom: 24px;">${message}</div>
            <div style="color: #64748b; font-size: 0.98rem; text-align: center; margin-top: 32px;">
              This is an automated notification from the NZFSS Registration System.<br />
              Please do not reply to this email.
            </div>
            <div style="text-align: center; color: #94a3b8; font-size: 0.93rem; margin-top: 16px;">
              © ${new Date().getFullYear()} NZFSS. All rights reserved.
            </div>
          </div>
        `
            });
        }
        catch (error) {
            logger_1.logger.error('Error sending generic notification email:', error);
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map