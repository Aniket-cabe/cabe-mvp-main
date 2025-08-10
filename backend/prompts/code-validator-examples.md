# AuditBot Code Validator Examples

This document shows how AuditBot processes different types of code submissions and the expected responses.

## Test Case 1: Plagiarized React Navbar (FAIL)

**Input Code:**

```javascript
// Copied from popular tutorial
import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/">LOGO</a>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="/" className="nav-links">
              Home
            </a>
          </li>
          <li className="nav-item">
            <a href="/about" className="nav-links">
              About
            </a>
          </li>
          <li className="nav-item">
            <a href="/services" className="nav-links">
              Services
            </a>
          </li>
          <li className="nav-item">
            <a href="/contact" className="nav-links">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
```

**AuditBot Response:**

```json
{
  "verdict": "fail",
  "score": 0,
  "plagiarismScore": 90,
  "cognitiveComplexity": 3,
  "reasons": [
    "Plagiarism score 90% - exact match with tutorial code",
    "No modifications or improvements from original source",
    "Redundant CSS class structure"
  ],
  "flags": ["plagiarism", "style"],
  "criticalIssues": [
    "Code appears to be copied verbatim from external tutorial"
  ],
  "suggestions": []
}
```

## Test Case 2: Clean FizzBuzz Implementation (PASS)

**Input Code:**

```javascript
/**
 * FizzBuzz implementation with proper error handling
 * @param {number} max - Maximum number to iterate to
 * @returns {string[]} Array of FizzBuzz results
 */
function fizzBuzz(max) {
  if (typeof max !== 'number' || max < 1) {
    throw new Error('Max must be a positive number');
  }

  const results = [];

  for (let i = 1; i <= max; i++) {
    if (i % 15 === 0) {
      results.push('FizzBuzz');
    } else if (i % 3 === 0) {
      results.push('Fizz');
    } else if (i % 5 === 0) {
      results.push('Buzz');
    } else {
      results.push(i.toString());
    }
  }

  return results;
}

// Example usage with error handling
try {
  const output = fizzBuzz(100);
  console.log(output.slice(0, 15)); // Show first 15 results
} catch (error) {
  console.error('FizzBuzz error:', error.message);
}

export { fizzBuzz };
```

**AuditBot Response:**

```json
{
  "verdict": "pass",
  "score": 85,
  "plagiarismScore": 25,
  "cognitiveComplexity": 6,
  "reasons": [],
  "flags": [],
  "criticalIssues": [],
  "suggestions": [
    "Consider using constants for divisors (3, 5, 15)",
    "JSDoc documentation is well-structured"
  ]
}
```

## Test Case 3: Security Vulnerabilities (FAIL)

**Input Code:**

```javascript
const express = require('express');
const app = express();

// Exposed API key - CRITICAL SECURITY ISSUE
const API_KEY = 'sk_test_51H8K9LGHf9vYZp0123456789';
const DATABASE_URL = 'postgres://user:password123@localhost:5432/mydb';

app.use(express.json());

// SQL Injection vulnerability
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;

  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// XSS vulnerability
app.post('/comments', (req, res) => {
  const comment = req.body.comment;
  document.getElementById('comments').innerHTML += `<div>${comment}</div>`;
  res.send('Comment added');
});

// Unsafe eval usage
app.post('/calculate', (req, res) => {
  const expression = req.body.expression;
  const result = eval(expression); // DANGEROUS!
  res.json({ result });
});

app.listen(3000);
```

**AuditBot Response:**

```json
{
  "verdict": "fail",
  "score": 5,
  "plagiarismScore": 15,
  "cognitiveComplexity": 4,
  "reasons": [
    "Hardcoded API key found: 'sk_test_***'",
    "Database credentials exposed in plain text",
    "SQL injection vulnerability in /users/:id endpoint",
    "XSS vulnerability in comment handling",
    "Unsafe eval() usage allows code injection"
  ],
  "flags": ["security"],
  "criticalIssues": [
    "Multiple security vulnerabilities pose immediate risk",
    "Exposed credentials allow unauthorized access",
    "Code injection vulnerabilities enable arbitrary code execution"
  ],
  "suggestions": []
}
```

## Test Case 4: Overly Complex Function (FAIL)

**Input Code:**

```javascript
function processUserData(userData, options, callbacks, validators) {
  if (userData && userData.length > 0) {
    if (options && options.validate) {
      if (validators && validators.length > 0) {
        for (let i = 0; i < userData.length; i++) {
          if (userData[i] && userData[i].id) {
            for (let j = 0; j < validators.length; j++) {
              if (validators[j] && validators[j].type) {
                if (validators[j].type === 'email') {
                  if (userData[i].email && userData[i].email.includes('@')) {
                    if (callbacks && callbacks.onValidEmail) {
                      callbacks.onValidEmail(userData[i]);
                    } else {
                      console.log('Valid email found');
                    }
                  } else {
                    if (callbacks && callbacks.onInvalidEmail) {
                      callbacks.onInvalidEmail(userData[i]);
                    } else {
                      console.log('Invalid email');
                    }
                  }
                } else if (validators[j].type === 'phone') {
                  if (userData[i].phone && userData[i].phone.match(/\d{10}/)) {
                    if (callbacks && callbacks.onValidPhone) {
                      callbacks.onValidPhone(userData[i]);
                    }
                  } else {
                    if (callbacks && callbacks.onInvalidPhone) {
                      callbacks.onInvalidPhone(userData[i]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return userData;
}

// Unused function
function calculate() {
  return 42;
}

// Dead code
if (false) {
  console.log('This will never run');
}
```

**AuditBot Response:**

```json
{
  "verdict": "fail",
  "score": 20,
  "plagiarismScore": 10,
  "cognitiveComplexity": 18,
  "reasons": [
    "Cognitive complexity 18 exceeds limit of 15",
    "Function processUserData() has excessive nesting (7 levels)",
    "Unused function calculate() detected",
    "Dead code found: unreachable if block",
    "Poor error handling and validation logic"
  ],
  "flags": ["complexity", "logic"],
  "criticalIssues": [
    "Function is too complex to maintain safely",
    "Dead code indicates poor code quality"
  ],
  "suggestions": []
}
```

## Test Case 5: Async/Await Misuse (FAIL)

**Input Code:**

```javascript
// Poor async/await usage
async function fetchUserData() {
  const response = fetch('/api/users'); // Missing await!
  return response.json(); // This will fail
}

// Race condition
let counter = 0;
async function incrementCounter() {
  const current = counter;
  await delay(100);
  counter = current + 1; // Race condition!
}

// Memory leak - event listener not removed
function setupEventListener() {
  const button = document.getElementById('myButton');
  button.addEventListener('click', async () => {
    await fetchUserData();
  });
  // No cleanup!
}

// Infinite recursion potential
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2); // No memoization, will stack overflow
}

// Unused imports
import { unused1, unused2 } from 'some-library';
import React from 'react'; // Not used in this file

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**AuditBot Response:**

```json
{
  "verdict": "fail",
  "score": 25,
  "plagiarismScore": 5,
  "cognitiveComplexity": 8,
  "reasons": [
    "Missing await in fetchUserData() - will return Promise",
    "Race condition in incrementCounter() function",
    "Memory leak: event listener not cleaned up",
    "Infinite recursion risk in fibonacci() without memoization",
    "Unused imports: unused1, unused2, React"
  ],
  "flags": ["logic"],
  "criticalIssues": [
    "Async/await misuse will cause runtime errors",
    "Race condition creates unpredictable behavior",
    "Memory leak will degrade performance over time"
  ],
  "suggestions": []
}
```

## Test Case 6: High-Quality TypeScript (PASS)

**Input Code:**

```typescript
/**
 * User service for managing user operations
 */
interface User {
  readonly id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  update(
    id: string,
    updates: Partial<Pick<User, 'name' | 'email'>>
  ): Promise<User>;
}

class UserService {
  constructor(private readonly repository: UserRepository) {}

  /**
   * Validates email format using RFC 5322 compliant regex
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Creates a new user with validation
   */
  async createUser(name: string, email: string): Promise<User> {
    if (!name?.trim()) {
      throw new Error('Name is required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      return await this.repository.create({ name: name.trim(), email });
    } catch (error) {
      throw new Error(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Retrieves user by ID with proper error handling
   */
  async getUserById(id: string): Promise<User> {
    if (!id?.trim()) {
      throw new Error('User ID is required');
    }

    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    return user;
  }
}

export { UserService, type User, type UserRepository };
```

**AuditBot Response:**

```json
{
  "verdict": "pass",
  "score": 92,
  "plagiarismScore": 8,
  "cognitiveComplexity": 6,
  "reasons": [],
  "flags": [],
  "criticalIssues": [],
  "suggestions": [
    "Excellent TypeScript usage with proper interfaces",
    "Good error handling and input validation",
    "Well-documented with JSDoc comments"
  ]
}
```

## Summary of Test Results

| Test Case          | Verdict | Primary Issue            | Score | Plagiarism | Complexity |
| ------------------ | ------- | ------------------------ | ----- | ---------- | ---------- |
| React Navbar       | FAIL    | Plagiarism 90%           | 0     | 90         | 3          |
| Clean FizzBuzz     | PASS    | None                     | 85    | 25         | 6          |
| Security Issues    | FAIL    | Multiple vulnerabilities | 5     | 15         | 4          |
| Complex Function   | FAIL    | Complexity 18            | 20    | 10         | 18         |
| Async Misuse       | FAIL    | Logic errors             | 25    | 5          | 8          |
| Quality TypeScript | PASS    | None                     | 92    | 8          | 6          |

## Key Patterns Observed

### Automatic Failures

- **Plagiarism >80%**: Immediate fail regardless of code quality
- **Security vulnerabilities**: Hard-coded credentials, injection risks
- **Complexity >15**: Functions too complex to maintain
- **Critical logic errors**: Async misuse, race conditions, memory leaks

### Pass Criteria

- **Plagiarism <30%**: Acceptable similarity levels
- **Complexity ≤15**: Maintainable code structure
- **No security issues**: Safe coding practices
- **Clean logic**: Proper async handling, no dead code

### Scoring System

- **0-40**: Failed submissions (security, plagiarism, complexity)
- **60-79**: Passing with minor issues
- **80-100**: High-quality code with best practices
