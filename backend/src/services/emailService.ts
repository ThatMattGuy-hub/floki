import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase';
import logger from '../config/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

interface EmailResult {
  success: boolean;
  error?: string;
}

interface EmailSettings {
  provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
}

// Cache for email settings (refresh every 5 minutes)
let cachedSettings: EmailSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEmailSettings(): Promise<EmailSettings | null> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedSettings && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('email_settings')
      .select('*')
      .single();

    if (error || !data) {
      logger.warn('No email settings found in database, falling back to ENV vars');
      return null;
    }

    cachedSettings = data as EmailSettings;
    cacheTimestamp = now;
    return cachedSettings;
  } catch (err) {
    logger.error('Failed to fetch email settings:', err);
    return null;
  }
}

// Create reusable transporter
const createTransporter = async () => {
  // Try database settings first
  const dbSettings = await getEmailSettings();
  
  if (dbSettings && dbSettings.smtp_host && dbSettings.smtp_user) {
    return {
      transporter: nodemailer.createTransport({
        host: dbSettings.smtp_host,
        port: dbSettings.smtp_port || 587,
        secure: dbSettings.smtp_port === 465,
        auth: {
          user: dbSettings.smtp_user,
          pass: dbSettings.smtp_password
        },
        tls: {
          rejectUnauthorized: false
        }
      }),
      from: `"${dbSettings.from_name || 'Project Management'}" <${dbSettings.smtp_user}>`
    };
  }

  // Fallback to environment variables
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

  if (emailProvider === 'smtp' && process.env.SMTP_USER) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      }),
      from: process.env.EMAIL_FROM || process.env.SMTP_USER
    };
  }

  throw new Error('Email not configured. Please configure SMTP settings in Admin > Email Settings.');
};

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const { transporter, from } = await createTransporter();

    const mailOptions = {
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to send email:', {
      error: error.message,
      to: options.to,
      subject: options.subject
    });

    return {
      success: false,
      error: error.message
    };
  }
}

export async function sendBulkEmails(emails: EmailOptions[]): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const { transporter } = await createTransporter();
    await transporter.verify();
    logger.info('Email configuration is valid');
    return true;
  } catch (error: any) {
    logger.error('Email configuration error:', error.message);
    return false;
  }
}

