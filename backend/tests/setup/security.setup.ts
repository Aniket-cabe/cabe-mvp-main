import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Security test utilities
export const securityTestUtils = {
  // Common attack payloads
  payloads: {
    sqlInjection: [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "1' OR '1' = '1' --"
    ],
    xss: [
      "<script>alert('XSS')</script>",
      "javascript:alert('XSS')",
      "<img src=x onerror=alert('XSS')>",
      "';alert('XSS');//",
      "<svg onload=alert('XSS')>"
    ],
    pathTraversal: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
    ],
    commandInjection: [
      "; ls -la",
      "| cat /etc/passwd",
      "& dir",
      "`whoami`",
      "$(id)"
    ]
  },
  
  // Generate malicious headers
  maliciousHeaders: {
    'X-Forwarded-For': '192.168.1.1',
    'User-Agent': 'Mozilla/5.0 (compatible; EvilBot/1.0)',
    'Referer': 'http://evil.com',
    'X-Requested-With': 'XMLHttpRequest'
  },
  
  // Test JWT tokens
  jwtTokens: {
    valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid_signature',
    malformed: 'invalid.jwt.token',
    empty: ''
  }
};

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3003';
  
  // Disable rate limiting for security tests
  process.env.DISABLE_RATE_LIMIT = 'true';
});

afterAll(async () => {
  // Cleanup
});

beforeEach(() => {
  // Reset security state
});

afterEach(() => {
  // Cleanup after each test
});
