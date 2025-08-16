// Temporary type overrides to get build working
declare global {
  interface User {
    [key: string]: any;
  }
  
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
