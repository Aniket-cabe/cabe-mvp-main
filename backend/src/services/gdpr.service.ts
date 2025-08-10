import { executeSQLString } from '../../db';
import logger from '../utils/logger';

export class GDPRService {
  static async exportUserData(userId: string): Promise<any> {
    try {
          const userData = await executeSQLString(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

          const submissions = await executeSQLString(
      'SELECT id, task_id, code, language, score, submitted_at FROM submissions WHERE user_id = $1',
      [userId]
    );

    const auditLogs = await executeSQLString(
      'SELECT action, resource_type, resource_id, details, timestamp FROM audit_logs WHERE user_id = $1',
      [userId]
    );

      return {
        user: userData.rows[0],
        submissions: submissions.rows,
        auditLogs: auditLogs.rows,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to export user data:', error);
      throw error;
    }
  }

  static async deleteUserData(userId: string): Promise<void> {
    try {
      await executeSQLString('BEGIN');
      await executeSQLString('DELETE FROM submissions WHERE user_id = $1', [
        userId,
      ]);
      await executeSQLString('DELETE FROM audit_logs WHERE user_id = $1', [
        userId,
      ]);
      await executeSQLString('DELETE FROM users WHERE id = $1', [userId]);
      await executeSQLString('COMMIT');

      logger.info(`User data deleted for user: ${userId}`);
    } catch (error) {
      await executeSQLString('ROLLBACK');
      logger.error('Failed to delete user data:', error);
      throw error;
    }
  }
}
