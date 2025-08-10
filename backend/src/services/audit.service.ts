import { executeWithRetry, executeSQL } from '../../db';
import logger from '../utils/logger';

export class AuditService {
  static async logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      await executeSQL(
        'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          userId,
          action,
          resourceType,
          resourceId,
          JSON.stringify(details),
          ipAddress,
          userAgent,
        ]
      );
      logger.info(
        `Audit log: ${action} by ${userId} on ${resourceType}:${resourceId}`
      );
    } catch (error) {
      logger.error('Failed to log audit action:', error);
    }
  }
}
