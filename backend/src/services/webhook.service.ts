import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';

export class WebhookService {
  private static webhooks: Map<string, string> = new Map();

  static registerWebhook(event: string, url: string, secret?: string): void {
    this.webhooks.set(event, url);
    logger.info(`Webhook registered for event: ${event} -> ${url}`);
  }

  static async sendWebhook(
    event: string,
    data: any,
    secret?: string
  ): Promise<void> {
    const url = this.webhooks.get(event);
    if (!url) {
      logger.warn(`No webhook registered for event: ${event}`);
      return;
    }

    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (secret) {
        const signature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Webhook-Signature'] = signature;
      }

      await axios.post(url, payload, { headers, timeout: 10000 });
      logger.info(`Webhook sent successfully: ${event} -> ${url}`);
    } catch (error) {
      logger.error(`Failed to send webhook: ${event} -> ${url}`, error);
    }
  }

  static async sendSlackNotification(
    channel: string,
    message: string
  ): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.warn('Slack webhook URL not configured');
      return;
    }

    try {
      await axios.post(
        webhookUrl,
        { channel, text: message },
        { timeout: 5000 }
      );
      logger.info(`Slack notification sent to ${channel}`);
    } catch (error) {
      logger.error('Failed to send Slack notification:', error);
    }
  }
}
