import express, { Request, Response, NextFunction } from 'express';
import { executeWithRetry } from '../db';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

interface RoleConfig {
  roles: {
    [key: string]: {
      description: string;
      permissions: string[];
    };
  };
}

class RBACMiddleware {
  private roleConfig: RoleConfig;

  constructor() {
    this.roleConfig = this.loadRoleConfig();
  }

  private loadRoleConfig(): RoleConfig {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, '../config/roles.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      logger.error('Failed to load RBAC config:', error);
      return { roles: {} };
    }
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const result = await executeWithRetry(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return [];
      }

      const userRole = result.rows[0].role || 'user';
      return this.roleConfig.roles[userRole]?.permissions || [];
    } catch (error) {
      logger.error('Failed to get user permissions:', error);
      return [];
    }
  }

  public requirePermission(requiredPermission: string) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userPermissions = await this.getUserPermissions(req.user.id);

        if (!userPermissions.includes(requiredPermission)) {
          logger.warn(
            `Permission denied: ${req.user.id} tried to access ${requiredPermission}`
          );
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Add permissions to request for audit logging
        req.user.permissions = userPermissions;
        next();
      } catch (error) {
        logger.error('RBAC middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  public requireRole(requiredRole: string) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const result = await executeWithRetry(
          'SELECT role FROM users WHERE id = $1',
          [req.user.id]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'User not found' });
        }

        const userRole = result.rows[0].role || 'user';

        if (userRole !== requiredRole) {
          logger.warn(
            `Role denied: ${req.user.id} (${userRole}) tried to access ${requiredRole} endpoint`
          );
          return res
            .status(403)
            .json({ error: 'Insufficient role permissions' });
        }

        next();
      } catch (error) {
        logger.error('RBAC role middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  public requireAnyPermission(requiredPermissions: string[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userPermissions = await this.getUserPermissions(req.user.id);

        const hasPermission = requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          logger.warn(
            `Permission denied: ${req.user.id} tried to access ${requiredPermissions.join(' OR ')}`
          );
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.user.permissions = userPermissions;
        next();
      } catch (error) {
        logger.error('RBAC any permission middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  public requireAllPermissions(requiredPermissions: string[]) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userPermissions = await this.getUserPermissions(req.user.id);

        const hasAllPermissions = requiredPermissions.every((permission) =>
          userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          logger.warn(
            `Permission denied: ${req.user.id} tried to access ${requiredPermissions.join(' AND ')}`
          );
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.user.permissions = userPermissions;
        next();
      } catch (error) {
        logger.error('RBAC all permissions middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
}

export const rbacMiddleware = new RBACMiddleware();
export default rbacMiddleware;
