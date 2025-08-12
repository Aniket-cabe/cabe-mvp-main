/**
 * Security Testing Script for CaBE Arena
 * 
 * Comprehensive security testing for XSS, SQL injection, CSRF,
 * and other common vulnerabilities across all skill categories.
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_BASE_URL = 'http://localhost:5173';

// Security test vectors
const securityTests = {
  xss: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<svg onload="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>',
    '\'><script>alert("XSS")</script>',
    '"><img src=x onerror=alert("XSS")>',
    '\'><img src=x onerror=alert("XSS")>',
  ],
  sqlInjection: [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "1' OR '1' = '1' #",
    "1' UNION SELECT username,password FROM users--",
    "'; INSERT INTO users VALUES ('hacker','hacked'); --",
  ],
  csrf: [
    'malicious-token',
    'invalid-token',
    'expired-token',
    'null',
    'undefined',
    '',
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
  ],
  commandInjection: [
    '; ls -la',
    '| cat /etc/passwd',
    '&& rm -rf /',
    '; whoami',
    '| id',
    '&& echo "hacked"',
  ],
  noSqlInjection: [
    '{"$gt": ""}',
    '{"$ne": null}',
    '{"$where": "1==1"}',
    '{"$regex": ".*"}',
    '{"$exists": true}',
  ],
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  vulnerabilities: [],
  tests: [],
};

// Helper function to log test results
function logTestResult(testName, passed, details = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  
  if (details) {
    console.log(`   Details: ${details}`);
  }
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
    results.vulnerabilities.push({ test: testName, details });
  }
  
  results.tests.push({ name: testName, passed, details });
}

// Test 1: XSS Prevention
async function testXSSPrevention() {
  console.log('\n🔒 TESTING XSS PREVENTION');
  console.log('-'.repeat(25));
  
  try {
    // Test XSS in task submission
    const xssTests = [];
    
    for (const payload of securityTests.xss) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/tasks/submit`, {
          task_id: 'test-task-id',
          proof: payload,
          code: payload,
        });
        
        // Check if payload was sanitized or blocked
        const responseText = JSON.stringify(response.data);
        const payloadDetected = responseText.includes(payload) && 
                               !responseText.includes('sanitized') &&
                               !responseText.includes('invalid');
        
        if (payloadDetected) {
          xssTests.push(false);
          logTestResult(`XSS in task submission: ${payload.substring(0, 30)}...`, false, 'Payload not sanitized');
        } else {
          xssTests.push(true);
          logTestResult(`XSS in task submission: ${payload.substring(0, 30)}...`, true);
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 422) {
          xssTests.push(true);
          logTestResult(`XSS in task submission: ${payload.substring(0, 30)}...`, true, 'Request properly rejected');
        } else {
          xssTests.push(false);
          logTestResult(`XSS in task submission: ${payload.substring(0, 30)}...`, false, error.message);
        }
      }
    }
    
    const xssPassRate = (xssTests.filter(test => test).length / xssTests.length) * 100;
    logTestResult('XSS Prevention Overall', xssPassRate >= 90, `${xssPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('XSS Prevention', false, error.message);
  }
}

// Test 2: SQL Injection Prevention
async function testSQLInjectionPrevention() {
  console.log('\n🔒 TESTING SQL INJECTION PREVENTION');
  console.log('-'.repeat(35));
  
  try {
    const sqlTests = [];
    
    for (const payload of securityTests.sqlInjection) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks?skill=${encodeURIComponent(payload)}`);
        
        // Check if SQL injection was attempted
        const responseText = JSON.stringify(response.data);
        const sqlError = responseText.toLowerCase().includes('sql') || 
                        responseText.toLowerCase().includes('syntax') ||
                        responseText.toLowerCase().includes('database');
        
        if (sqlError) {
          sqlTests.push(false);
          logTestResult(`SQL Injection: ${payload.substring(0, 30)}...`, false, 'SQL error detected');
        } else {
          sqlTests.push(true);
          logTestResult(`SQL Injection: ${payload.substring(0, 30)}...`, true);
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 422) {
          sqlTests.push(true);
          logTestResult(`SQL Injection: ${payload.substring(0, 30)}...`, true, 'Request properly rejected');
        } else {
          sqlTests.push(false);
          logTestResult(`SQL Injection: ${payload.substring(0, 30)}...`, false, error.message);
        }
      }
    }
    
    const sqlPassRate = (sqlTests.filter(test => test).length / sqlTests.length) * 100;
    logTestResult('SQL Injection Prevention Overall', sqlPassRate >= 90, `${sqlPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('SQL Injection Prevention', false, error.message);
  }
}

// Test 3: CSRF Protection
async function testCSRFProtection() {
  console.log('\n🔒 TESTING CSRF PROTECTION');
  console.log('-'.repeat(25));
  
  try {
    const csrfTests = [];
    
    for (const token of securityTests.csrf) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/tasks/submit`, {
          task_id: 'test-task-id',
          proof: 'test proof',
          code: 'test code',
        }, {
          headers: {
            'X-CSRF-Token': token,
            'Authorization': 'Bearer invalid-token',
          },
        });
        
        // Check if request was rejected due to invalid CSRF token
        if (response.status === 403 || response.status === 401) {
          csrfTests.push(true);
          logTestResult(`CSRF Protection: ${token}`, true, 'Request properly rejected');
        } else {
          csrfTests.push(false);
          logTestResult(`CSRF Protection: ${token}`, false, 'Request accepted with invalid token');
        }
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          csrfTests.push(true);
          logTestResult(`CSRF Protection: ${token}`, true, 'Request properly rejected');
        } else {
          csrfTests.push(false);
          logTestResult(`CSRF Protection: ${token}`, false, error.message);
        }
      }
    }
    
    const csrfPassRate = (csrfTests.filter(test => test).length / csrfTests.length) * 100;
    logTestResult('CSRF Protection Overall', csrfPassRate >= 90, `${csrfPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('CSRF Protection', false, error.message);
  }
}

// Test 4: Path Traversal Prevention
async function testPathTraversalPrevention() {
  console.log('\n🔒 TESTING PATH TRAVERSAL PREVENTION');
  console.log('-'.repeat(35));
  
  try {
    const pathTests = [];
    
    for (const payload of securityTests.pathTraversal) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks/${encodeURIComponent(payload)}`);
        
        // Check if path traversal was attempted
        const responseText = JSON.stringify(response.data);
        const pathError = responseText.includes('passwd') || 
                         responseText.includes('hosts') ||
                         responseText.includes('system32');
        
        if (pathError) {
          pathTests.push(false);
          logTestResult(`Path Traversal: ${payload.substring(0, 30)}...`, false, 'Path traversal successful');
        } else {
          pathTests.push(true);
          logTestResult(`Path Traversal: ${payload.substring(0, 30)}...`, true);
        }
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400) {
          pathTests.push(true);
          logTestResult(`Path Traversal: ${payload.substring(0, 30)}...`, true, 'Request properly rejected');
        } else {
          pathTests.push(false);
          logTestResult(`Path Traversal: ${payload.substring(0, 30)}...`, false, error.message);
        }
      }
    }
    
    const pathPassRate = (pathTests.filter(test => test).length / pathTests.length) * 100;
    logTestResult('Path Traversal Prevention Overall', pathPassRate >= 90, `${pathPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('Path Traversal Prevention', false, error.message);
  }
}

// Test 5: Input Validation
async function testInputValidation() {
  console.log('\n🔒 TESTING INPUT VALIDATION');
  console.log('-'.repeat(25));
  
  try {
    const validationTests = [];
    
    // Test email validation
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test..test@example.com',
      'test@example..com',
      'test@.com',
    ];
    
    for (const email of invalidEmails) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email,
          password: 'testpass123',
          primary_skill: 'Full-Stack Software Development',
        });
        
        if (response.status === 400 || response.status === 422) {
          validationTests.push(true);
          logTestResult(`Email Validation: ${email}`, true, 'Invalid email properly rejected');
        } else {
          validationTests.push(false);
          logTestResult(`Email Validation: ${email}`, false, 'Invalid email accepted');
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 422) {
          validationTests.push(true);
          logTestResult(`Email Validation: ${email}`, true, 'Invalid email properly rejected');
        } else {
          validationTests.push(false);
          logTestResult(`Email Validation: ${email}`, false, error.message);
        }
      }
    }
    
    // Test skill validation
    const invalidSkills = [
      'invalid-skill',
      'web-dev',
      'design',
      'content',
      'hacked-skill',
    ];
    
    for (const skill of invalidSkills) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
          email: 'test@example.com',
          password: 'testpass123',
          primary_skill: skill,
        });
        
        if (response.status === 400 || response.status === 422) {
          validationTests.push(true);
          logTestResult(`Skill Validation: ${skill}`, true, 'Invalid skill properly rejected');
        } else {
          validationTests.push(false);
          logTestResult(`Skill Validation: ${skill}`, false, 'Invalid skill accepted');
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 422) {
          validationTests.push(true);
          logTestResult(`Skill Validation: ${skill}`, true, 'Invalid skill properly rejected');
        } else {
          validationTests.push(false);
          logTestResult(`Skill Validation: ${skill}`, false, error.message);
        }
      }
    }
    
    const validationPassRate = (validationTests.filter(test => test).length / validationTests.length) * 100;
    logTestResult('Input Validation Overall', validationPassRate >= 90, `${validationPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('Input Validation', false, error.message);
  }
}

// Test 6: Authentication & Authorization
async function testAuthenticationAuthorization() {
  console.log('\n🔒 TESTING AUTHENTICATION & AUTHORIZATION');
  console.log('-'.repeat(40));
  
  try {
    const authTests = [];
    
    // Test unauthorized access to protected endpoints
    const protectedEndpoints = [
      '/api/arena/leaderboard',
      '/api/arena/stats',
      '/api/tasks/submit',
      '/api/users/profile',
    ];
    
    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        
        if (response.status === 401 || response.status === 403) {
          authTests.push(true);
          logTestResult(`Unauthorized Access: ${endpoint}`, true, 'Access properly denied');
        } else {
          authTests.push(false);
          logTestResult(`Unauthorized Access: ${endpoint}`, false, 'Access allowed without authentication');
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          authTests.push(true);
          logTestResult(`Unauthorized Access: ${endpoint}`, true, 'Access properly denied');
        } else {
          authTests.push(false);
          logTestResult(`Unauthorized Access: ${endpoint}`, false, error.message);
        }
      }
    }
    
    // Test invalid token access
    try {
      const response = await axios.get(`${API_BASE_URL}/api/arena/leaderboard`, {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      
      if (response.status === 401 || response.status === 403) {
        authTests.push(true);
        logTestResult('Invalid Token Access', true, 'Invalid token properly rejected');
      } else {
        authTests.push(false);
        logTestResult('Invalid Token Access', false, 'Invalid token accepted');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        authTests.push(true);
        logTestResult('Invalid Token Access', true, 'Invalid token properly rejected');
      } else {
        authTests.push(false);
        logTestResult('Invalid Token Access', false, error.message);
      }
    }
    
    const authPassRate = (authTests.filter(test => test).length / authTests.length) * 100;
    logTestResult('Authentication & Authorization Overall', authPassRate >= 90, `${authPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('Authentication & Authorization', false, error.message);
  }
}

// Test 7: Rate Limiting
async function testRateLimiting() {
  console.log('\n🔒 TESTING RATE LIMITING');
  console.log('-'.repeat(20));
  
  try {
    const rateLimitTests = [];
    
    // Test rapid requests to trigger rate limiting
    const rapidRequests = [];
    for (let i = 0; i < 20; i++) {
      rapidRequests.push(axios.get(`${API_BASE_URL}/health`));
    }
    
    const responses = await Promise.all(rapidRequests);
    const rateLimited = responses.some(response => response.status === 429);
    
    if (rateLimited) {
      rateLimitTests.push(true);
      logTestResult('Rate Limiting', true, 'Rate limiting properly enforced');
    } else {
      rateLimitTests.push(false);
      logTestResult('Rate Limiting', false, 'Rate limiting not enforced');
    }
    
    const rateLimitPassRate = (rateLimitTests.filter(test => test).length / rateLimitTests.length) * 100;
    logTestResult('Rate Limiting Overall', rateLimitPassRate >= 90, `${rateLimitPassRate.toFixed(1)}% pass rate`);
    
  } catch (error) {
    logTestResult('Rate Limiting', false, error.message);
  }
}

// Run all security tests
async function runSecurityTests() {
  console.log('🛡️ COMPREHENSIVE SECURITY TESTING FOR CABE ARENA');
  console.log('='.repeat(55));
  console.log();

  await testXSSPrevention();
  await testSQLInjectionPrevention();
  await testCSRFProtection();
  await testPathTraversalPrevention();
  await testInputValidation();
  await testAuthenticationAuthorization();
  await testRateLimiting();

  // Security assessment summary
  console.log('\n📊 SECURITY ASSESSMENT SUMMARY');
  console.log('='.repeat(30));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Security Score: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.vulnerabilities.length > 0) {
    console.log('\n🚨 VULNERABILITIES DETECTED:');
    console.log('-'.repeat(25));
    results.vulnerabilities.forEach(vuln => {
      console.log(`❌ ${vuln.test}: ${vuln.details}`);
    });
  }
  
  // Security recommendations
  console.log('\n🔧 SECURITY RECOMMENDATIONS:');
  console.log('-'.repeat(25));
  
  if (results.passed / (results.passed + results.failed) >= 0.95) {
    console.log('✅ Excellent security posture - system is well-protected');
  } else if (results.passed / (results.passed + results.failed) >= 0.85) {
    console.log('⚠️ Good security posture - minor improvements recommended');
  } else {
    console.log('❌ Security improvements needed - address vulnerabilities immediately');
  }
  
  console.log('\n🎉 SECURITY TESTING COMPLETED!');
  console.log('='.repeat(55));
  
  return results;
}

// Run the security tests
runSecurityTests().catch(console.error);
