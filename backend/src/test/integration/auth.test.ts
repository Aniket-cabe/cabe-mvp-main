import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { testUtils, testSupabase } from '../setup';

describe('Authentication Integration Tests', () => {
  beforeEach(async () => {
    await testUtils.cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPassword123!',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'TestPassword123!',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('password');
    });

    it('should reject duplicate email registration', async () => {
      // Create first user
      const userData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'TestPassword123!',
        full_name: 'Test User 1'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const duplicateUserData = {
        email: 'test@example.com',
        username: 'testuser2',
        password: 'TestPassword123!',
        full_name: 'Test User 2'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      testUser = await testUtils.createTestUser({
        email: 'test@example.com',
        username: 'testuser',
        password_hash: '$2b$10$test.hash.for.testing.purposes.only'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should handle Google OAuth callback', async () => {
      const googleData = {
        access_token: 'mock-google-access-token',
        id_token: 'mock-google-id-token'
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should handle Google OAuth errors', async () => {
      const googleData = {
        access_token: 'invalid-token',
        id_token: 'invalid-id-token'
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // First login to get a token
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(token);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('logged out');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
    });

    it('should reject without valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const user = await testUtils.createTestUser();
      const token = testUtils.generateTestToken(user.id);

      const updateData = {
        full_name: 'Updated Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.full_name).toBe(updateData.full_name);
      expect(response.body.user.bio).toBe(updateData.bio);
    });

    it('should reject profile update without token', async () => {
      const updateData = {
        full_name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const user = await testUtils.createTestUser({
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reset link sent');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      // Should not reveal if email exists or not
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetData = {
        token: 'valid-reset-token',
        password: 'NewPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('password reset');
    });

    it('should reject reset with invalid token', async () => {
      const resetData = {
        token: 'invalid-reset-token',
        password: 'NewPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
