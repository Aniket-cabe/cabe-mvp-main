import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('App', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return 200 for API status', async () => {
    const response = await request(app).get('/api/status');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Cabe Arena API is running'
    );
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not found');
  });
});
