import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock crypto module for encryption service
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn((size) => Buffer.alloc(size)),
    pbkdf2Sync: vi.fn((password, salt, iterations, keylen, digest) => Buffer.alloc(keylen)),
    createCipher: vi.fn(() => ({
      update: vi.fn((text, inputEncoding, outputEncoding) => 'mock-encrypted'),
      final: vi.fn((outputEncoding) => 'mock-final')
    })),
    createDecipher: vi.fn(() => ({
      update: vi.fn((text, inputEncoding, outputEncoding) => 'mock-decrypted'),
      final: vi.fn((outputEncoding) => 'mock-final')
    }))
  },
  randomBytes: vi.fn((size) => Buffer.alloc(size)),
  pbkdf2Sync: vi.fn((password, salt, iterations, keylen, digest) => Buffer.alloc(keylen)),
  createCipher: vi.fn(() => ({
    update: vi.fn((text, inputEncoding, outputEncoding) => 'mock-encrypted'),
    final: vi.fn((outputEncoding) => 'mock-final')
  })),
  createDecipher: vi.fn(() => ({
    update: vi.fn((text, inputEncoding, outputEncoding) => 'mock-decrypted'),
    final: vi.fn((outputEncoding) => 'mock-final'
  }))
}));

// Mock Supabase client with comprehensive methods
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          range: vi.fn(() => Promise.resolve({ data: [], error: null })),
          filter: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      signUp: vi.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: Buffer.from('mock-data'), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock-url.com/file' } }))
      }))
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }
  }))
}));

// Mock Airtable with comprehensive table methods
vi.mock('airtable', () => ({
  default: vi.fn(() => ({
    base: vi.fn(() => ({
      'Tasks': {
        select: vi.fn(() => ({
          firstPage: vi.fn(() => Promise.resolve([])),
          eachPage: vi.fn((callback) => {
            callback([], () => {});
          }),
          all: vi.fn(() => Promise.resolve([]))
        })),
        find: vi.fn(() => Promise.resolve({ id: 'mock-task', fields: {} })),
        create: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        update: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        destroy: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        replace: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} }))
      },
      'Users': {
        select: vi.fn(() => ({
          firstPage: vi.fn(() => Promise.resolve([])),
          eachPage: vi.fn((callback) => {
            callback([], () => {});
          }),
          all: vi.fn(() => Promise.resolve([]))
        })),
        find: vi.fn(() => Promise.resolve({ id: 'mock-user', fields: {} })),
        create: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        update: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        destroy: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        replace: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} }))
      },
      'Submissions': {
        select: vi.fn(() => ({
          firstPage: vi.fn(() => Promise.resolve([])),
          eachPage: vi.fn((callback) => {
            callback([], () => {});
          }),
          all: vi.fn(() => Promise.resolve([]))
        })),
        find: vi.fn(() => Promise.resolve({ id: 'mock-submission', fields: {} })),
        create: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        update: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        destroy: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        replace: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} }))
      },
      'Achievements': {
        select: vi.fn(() => ({
          firstPage: vi.fn(() => Promise.resolve([])),
          eachPage: vi.fn((callback) => {
            callback([], () => {});
          }),
          all: vi.fn(() => Promise.resolve([]))
        })),
        find: vi.fn(() => Promise.resolve({ id: 'mock-achievement', fields: {} })),
        create: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        update: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        destroy: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} })),
        replace: vi.fn(() => Promise.resolve({ id: 'mock-record', fields: {} }))
      }
    }))
  }))
}));

// Mock external services
vi.mock('mixpanel', () => ({
  default: vi.fn(() => ({
    track: vi.fn(),
    identify: vi.fn(),
    people: {
      set: vi.fn(),
      increment: vi.fn()
    }
  }))
}));

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
    verify: vi.fn(() => Promise.resolve(true))
  }))
}));

// Mock file system operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(() => Promise.resolve('mock-file-content')),
  writeFile: vi.fn(() => Promise.resolve()),
  unlink: vi.fn(() => Promise.resolve()),
  mkdir: vi.fn(() => Promise.resolve()),
  access: vi.fn(() => Promise.resolve())
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => 'mock-file-content'),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn()
}));

// Mock path operations
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => args.join('/')),
  dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/')),
  basename: vi.fn((path) => path.split('/').pop()),
  extname: vi.fn((path) => path.includes('.') ? '.' + path.split('.').pop() : '')
}));

// Mock JWT operations
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'mock-jwt-token'),
  verify: vi.fn(() => ({ userId: 'mock-user-id', role: 'user' })),
  decode: vi.fn(() => ({ userId: 'mock-user-id', role: 'user' }))
}));

// Mock bcryptjs for password hashing
vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('mock-hashed-password')),
  compare: vi.fn(() => Promise.resolve(true)),
  genSalt: vi.fn(() => Promise.resolve('mock-salt'))
}));

// Mock rate limiting
vi.mock('express-rate-limit', () => ({
  default: vi.fn(() => vi.fn((req, res, next) => next()))
}));

// Mock CORS
vi.mock('cors', () => ({
  default: vi.fn(() => vi.fn((req, res, next) => next()))
}));

// Mock helmet for security headers
vi.mock('helmet', () => ({
  default: vi.fn(() => vi.fn((req, res, next) => next()))
}));

// Mock compression
vi.mock('compression', () => ({
  default: vi.fn(() => vi.fn((req, res, next) => next()))
}));

// Mock multer for file uploads
vi.mock('multer', () => ({
  default: vi.fn(() => ({
    single: vi.fn(() => vi.fn((req, res, next) => next())),
    array: vi.fn(() => vi.fn((req, res, next) => next())),
    fields: vi.fn(() => vi.fn((req, res, next) => next()))
  }))
}));

// Mock AWS SDK
vi.mock('aws-sdk', () => ({
  S3: vi.fn(() => ({
    upload: vi.fn(() => ({
      promise: vi.fn(() => Promise.resolve({ Location: 'https://mock-s3-url.com/file' }))
    })),
    getObject: vi.fn(() => ({
      promise: vi.fn(() => Promise.resolve({ Body: Buffer.from('mock-data') }))
    })),
    deleteObject: vi.fn(() => ({
      promise: vi.fn(() => Promise.resolve())
    }))
  })),
  CloudFront: vi.fn(() => ({
    createInvalidation: vi.fn(() => ({
      promise: vi.fn(() => Promise.resolve({ Invalidation: { Id: 'mock-invalidation-id' } }))
    }))
  }))
}));

// Mock OpenAI for AI scoring
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: 'mock-ai-response'
            }
          }]
        }))
      }
    },
    images: {
      generate: vi.fn(() => Promise.resolve({
        data: [{ url: 'https://mock-image-url.com/image.jpg' }]
      }))
    }
  }))
}));

// Mock WebSocket
vi.mock('ws', () => ({
  WebSocketServer: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn()
  })),
  WebSocket: vi.fn(() => ({
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn()
  }))
}));

// Mock Redis for caching
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve()),
    del: vi.fn(() => Promise.resolve()),
    expire: vi.fn(() => Promise.resolve()),
    on: vi.fn()
  }))
}));

// Mock Bull for job queues
vi.mock('bull', () => ({
  default: vi.fn(() => ({
    add: vi.fn(() => Promise.resolve({ id: 'mock-job-id' })),
    process: vi.fn(),
    on: vi.fn(),
    close: vi.fn(() => Promise.resolve())
  }))
}));

// Mock Sentry for error tracking
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn()
}));

// Mock Winston for logging
vi.mock('winston', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn()
  })),
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    errors: vi.fn(),
    json: vi.fn(),
    simple: vi.fn()
  },
  transports: {
    Console: vi.fn(),
    File: vi.fn()
  }
}));

// Global test utilities
export const mockData = {
  users: [
    { id: 'user-1', email: 'test1@example.com', points: 1500, rank: 'Silver' },
    { id: 'user-2', email: 'test2@example.com', points: 500, rank: 'Bronze' }
  ],
  tasks: [
    { id: 'task-1', title: 'Test Task 1', points: 100, difficulty: 'Easy' },
    { id: 'task-2', title: 'Test Task 2', points: 200, difficulty: 'Medium' }
  ],
  submissions: [
    { id: 'sub-1', userId: 'user-1', taskId: 'task-1', status: 'approved', score: 95 }
  ]
};

// Mock request/response objects
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { id: 'mock-user-id', role: 'user' },
  ...overrides
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllTimers();
});
