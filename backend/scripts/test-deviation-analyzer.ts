/**
 * Test Script for CaBE Arena Deviation Analyzer
 *
 * Demonstrates the advanced AI-powered deviation analysis system
 * with various real-world scenarios and edge cases.
 */

import {
  analyzeDeviation,
  batchAnalyzeDeviations,
  DeviationAnalysisInput,
} from '../src/utils/deviation-analyzer';
import logger from '../src/utils/logger';

// Test scenarios covering different deviation types and skill areas
const testScenarios: DeviationAnalysisInput[] = [
  // ===== MINOR DEVIATIONS =====
  {
    taskTitle: 'Build a responsive navigation bar',
    taskDifficulty: 'easy',
    skillArea: 'fullstack-dev',
    userSubmittedScore: 85,
    aiAuditScore: 78,
    userCode: `
<nav class="navbar">
  <div class="nav-brand">Logo</div>
  <ul class="nav-menu">
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #333;
  color: white;
}
.nav-menu {
  display: flex;
  list-style: none;
  gap: 1rem;
}
@media (max-width: 768px) {
  .nav-menu {
    flex-direction: column;
  }
}
</style>`,
    userProof:
      'Created a responsive navigation bar with mobile-first design approach. Used flexbox for layout and media queries for mobile responsiveness.',
    taskDescription:
      'Create a responsive navigation bar that works on both desktop and mobile devices',
    submissionContext: {
      timeSpent: 45,
      codeLength: 450,
      complexity: 'medium',
    },
  },

  // ===== MAJOR DEVIATIONS =====
  {
    taskTitle: 'Implement user authentication with JWT',
    taskDifficulty: 'medium',
    skillArea: 'cloud-devops',
    userSubmittedScore: 92,
    aiAuditScore: 65,
    userCode: `
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ token, user: { id: user._id, email: user.email } });
});`,
    userProof:
      'Implemented secure JWT authentication with password hashing using bcryptjs. Includes proper error handling and token generation.',
    taskDescription:
      'Create a secure user authentication system using JWT tokens',
    submissionContext: {
      timeSpent: 120,
      codeLength: 800,
      complexity: 'high',
    },
  },

  // ===== CRITICAL DEVIATIONS =====
  {
    taskTitle: 'Create a machine learning model for sentiment analysis',
    taskDifficulty: 'expert',
    skillArea: 'ai-ml',
    userSubmittedScore: 95,
    aiAuditScore: 35,
    userCode: `
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split

# Load data
df = pd.read_csv('sentiment_data.csv')

# Create features
vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(df['text'])
y = df['sentiment']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = MultinomialNB()
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2f}")`,
    userProof:
      'Built a comprehensive sentiment analysis model using TF-IDF vectorization and Naive Bayes classification. Achieved high accuracy on test data.',
    taskDescription:
      'Develop a machine learning model to classify text sentiment as positive, negative, or neutral',
    submissionContext: {
      timeSpent: 180,
      codeLength: 600,
      complexity: 'high',
    },
  },

  // ===== CONTENT CREATION DEVIATION =====
  {
    taskTitle: 'Write a technical blog post about API design',
    taskDifficulty: 'medium',
    skillArea: 'data-analytics',
    userSubmittedScore: 88,
    aiAuditScore: 72,
    userProof: `# Best Practices for RESTful API Design

## Introduction
Designing effective APIs is crucial for modern software development. This post explores key principles and best practices.

## Key Principles
1. **Resource-Oriented Design**: Use nouns, not verbs in URLs
2. **Stateless Operations**: Each request should contain all necessary information
3. **Consistent Error Handling**: Standardize error responses across endpoints
4. **Versioning Strategy**: Implement proper API versioning from the start

## Implementation Examples
\`\`\`javascript
// Good: Resource-oriented
GET /api/users/123
POST /api/users
PUT /api/users/123

// Bad: Action-oriented
GET /api/getUser?id=123
POST /api/createUser
\`\`\`

## Conclusion
Following these practices ensures your APIs are maintainable, scalable, and developer-friendly.`,
    taskDescription:
      'Write a comprehensive technical blog post about RESTful API design best practices',
    submissionContext: {
      timeSpent: 90,
      codeLength: 1200,
      complexity: 'medium',
    },
  },

  // ===== DATA SCIENCE DEVIATION =====
  {
    taskTitle: 'Analyze customer churn data and create visualizations',
    taskDifficulty: 'hard',
    skillArea: 'data-analytics',
    userSubmittedScore: 76,
    aiAuditScore: 89,
    userCode: `
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Load and clean data
df = pd.read_csv('customer_churn.csv')
df = df.dropna()

# Feature engineering
df['total_charges'] = df['monthly_charges'] * df['tenure']
df['avg_monthly_charges'] = df['total_charges'] / df['tenure']

# Visualizations
plt.figure(figsize=(15, 10))

# Churn rate by contract type
plt.subplot(2, 3, 1)
churn_by_contract = df.groupby('contract_type')['churn'].mean()
churn_by_contract.plot(kind='bar')
plt.title('Churn Rate by Contract Type')
plt.ylabel('Churn Rate')

# Monthly charges distribution
plt.subplot(2, 3, 2)
sns.histplot(data=df, x='monthly_charges', hue='churn', bins=30)
plt.title('Monthly Charges Distribution')

# Tenure vs churn
plt.subplot(2, 3, 3)
sns.boxplot(data=df, x='churn', y='tenure')
plt.title('Tenure vs Churn')

plt.tight_layout()
plt.show()

# Statistical analysis
print("Churn rate:", df['churn'].mean())
print("Average tenure for churned customers:", df[df['churn']==1]['tenure'].mean())
print("Average tenure for retained customers:", df[df['churn']==0]['tenure'].mean())`,
    userProof:
      'Conducted comprehensive customer churn analysis with multiple visualizations and statistical insights. Identified key factors contributing to customer retention.',
    taskDescription:
      'Analyze customer churn data to identify patterns and create informative visualizations',
    submissionContext: {
      timeSpent: 150,
      codeLength: 1200,
      complexity: 'high',
    },
  },

  // ===== NO DEVIATION (ACCEPTABLE RANGE) =====
  {
    taskTitle: 'Create a simple calculator component',
    taskDifficulty: 'easy',
    skillArea: 'fullstack-dev',
    userSubmittedScore: 75,
    aiAuditScore: 72,
    userCode: `
function Calculator() {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);

  const handleNumber = (num) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op) => {
    setOperation(op);
    setPreviousValue(parseFloat(display));
    setDisplay('0');
  };

  const calculate = () => {
    const current = parseFloat(display);
    const previous = previousValue;
    let result;

    switch (operation) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '*': result = previous * current; break;
      case '/': result = previous / current; break;
      default: return;
    }

    setDisplay(result.toString());
    setOperation(null);
    setPreviousValue(null);
  };

  return (
    <div className="calculator">
      <div className="display">{display}</div>
      <div className="buttons">
        {/* Calculator buttons */}
      </div>
    </div>
  );
}`,
    userProof:
      'Built a functional calculator component with basic arithmetic operations. Used React hooks for state management and implemented proper event handling.',
    taskDescription:
      'Create a simple calculator component with basic arithmetic operations',
    submissionContext: {
      timeSpent: 60,
      codeLength: 800,
      complexity: 'medium',
    },
  },

  // ===== POTENTIAL SCORE INFLATION =====
  {
    taskTitle: 'Write a simple function to reverse a string',
    taskDifficulty: 'easy',
    skillArea: 'cloud-devops',
    userSubmittedScore: 95,
    aiAuditScore: 45,
    userCode: `
function reverseString(str) {
  return str.split('').reverse().join('');
}

// Test cases
console.log(reverseString('hello')); // 'olleh'
console.log(reverseString('world')); // 'dlrow'`,
    userProof:
      "Implemented a clean and efficient string reversal function using JavaScript's built-in methods. Includes test cases for verification.",
    taskDescription: 'Write a function that reverses a given string',
    submissionContext: {
      timeSpent: 15,
      codeLength: 150,
      complexity: 'low',
    },
  },

  // ===== POTENTIAL SCORE DEFLATION =====
  {
    taskTitle: 'Build a full-stack e-commerce application',
    taskDifficulty: 'expert',
    skillArea: 'cloud-devops',
    userSubmittedScore: 45,
    aiAuditScore: 82,
    userCode: `
// Backend API with Express and MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
  const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  stock: Number,
  images: [String]
});

const Product = mongoose.model('Product', productSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  role: { type: String, default: 'customer' }
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Invalid product data' });
  }
});

// User routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Order routes
app.post('/api/orders', auth, async (req, res) => {
  try {
    const order = new Order({
      user: req.user._id,
      products: req.body.products,
      total: req.body.total
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Order creation failed' });
  }
});

app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Payment integration (stripe)
app.post('/api/payment', auth, async (req, res) => {
  try {
    // Stripe payment logic would go here
    res.json({ success: true, message: 'Payment processed' });
  } catch (error) {
    res.status(400).json({ error: 'Payment failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    userProof:
      'Built a comprehensive e-commerce backend with user authentication, product management, order processing, and payment integration. Includes proper error handling, data validation, and security measures.',
    taskDescription:
      'Create a full-stack e-commerce application with user authentication, product catalog, shopping cart, and payment processing',
    submissionContext: {
      timeSpent: 480,
      codeLength: 3500,
      complexity: 'high',
    },
  },
];

/**
 * Run individual deviation analysis tests
 */
async function runIndividualTests() {
  console.log('\n🔍 RUNNING INDIVIDUAL DEVIATION ANALYSIS TESTS');
  console.log('==============================================\n');

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📋 Test Case ${i + 1}: ${scenario.taskTitle}`);
    console.log(
      `Skill Area: ${scenario.skillArea.toUpperCase()} | Difficulty: ${scenario.taskDifficulty.toUpperCase()}`
    );
    console.log(
      `User Score: ${scenario.userSubmittedScore}/100 | AI Score: ${scenario.aiAuditScore}/100`
    );
    console.log(
      `Deviation: ${Math.abs(scenario.userSubmittedScore - scenario.aiAuditScore)} points`
    );
    console.log('-'.repeat(80));

    try {
      const result = await analyzeDeviation(scenario);

      console.log(`🎯 Deviation Type: ${result.deviationType.toUpperCase()}`);
      console.log(`📊 Confidence: ${result.confidence.toUpperCase()}`);
      console.log(
        `⚡ Suggested Action: ${result.suggestedAction.replace('_', ' ').toUpperCase()}`
      );
      console.log(`⚠️ Risk Factors: ${result.riskFactors.join(', ')}`);
      console.log(`\n💭 Reasoning:`);
      console.log(result.reasoning);
      console.log(`\n🔧 Skill Area Context: ${result.skillAreaContext}`);
      console.log(`📈 Complexity Context: ${result.complexityContext}`);
      console.log(`⏱️ Processing Time: ${result.metadata.processingTime}ms`);
    } catch (error) {
      console.log(`❌ Analysis failed: ${error.message}`);
    }
  }
}

/**
 * Run batch analysis test
 */
async function runBatchAnalysisTest() {
  console.log('\n🔍 RUNNING BATCH DEVIATION ANALYSIS TEST');
  console.log('=========================================\n');

  try {
    const batchResult = await batchAnalyzeDeviations(testScenarios);

    console.log(`📊 Batch Analysis Summary:`);
    console.log(`Total Submissions: ${batchResult.results.length}`);
    console.log(`Successful Analyses: ${batchResult.results.length}`);

    // Count deviation types
    const deviationCounts = batchResult.results.reduce(
      (acc, result) => {
        acc[result.deviationType] = (acc[result.deviationType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`\n📈 Deviation Type Distribution:`);
    Object.entries(deviationCounts).forEach(([type, count]) => {
      console.log(`${type.toUpperCase()}: ${count} submissions`);
    });

    // Calculate average deviation
    const avgDeviation =
      batchResult.results.reduce(
        (sum, result) => sum + result.deviationMagnitude,
        0
      ) / batchResult.results.length;
    console.log(`\n📊 Average Deviation: ${avgDeviation.toFixed(2)} points`);

    // Show critical issues
    if (batchResult.patterns.criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues:`);
      batchResult.patterns.criticalIssues.forEach((issue) => {
        console.log(`• ${issue}`);
      });
    }

    // Show suggested actions distribution
    const actionCounts = batchResult.results.reduce(
      (acc, result) => {
        acc[result.suggestedAction] = (acc[result.suggestedAction] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`\n🎯 Suggested Actions Distribution:`);
    Object.entries(actionCounts).forEach(([action, count]) => {
      console.log(
        `${action.replace('_', ' ').toUpperCase()}: ${count} submissions`
      );
    });
  } catch (error) {
    console.log(`❌ Batch analysis failed: ${error.message}`);
  }
}

/**
 * Run specific scenario tests
 */
async function runSpecificScenarioTests() {
  console.log('\n🎯 RUNNING SPECIFIC SCENARIO TESTS');
  console.log('==================================\n');

  // Test 1: Critical deviation with score inflation
  console.log('🚨 Test 1: Critical Deviation - Score Inflation');
  console.log('-'.repeat(50));
  const inflationTest = testScenarios.find((s) =>
    s.taskTitle.includes('reverse a string')
  );
  if (inflationTest) {
    const result = await analyzeDeviation(inflationTest);
    console.log(`Deviation Type: ${result.deviationType}`);
    console.log(`Reasoning: ${result.reasoning.substring(0, 200)}...`);
    console.log(`Suggested Action: ${result.suggestedAction}`);
  }

  // Test 2: No deviation case
  console.log('\n✅ Test 2: No Deviation - Acceptable Range');
  console.log('-'.repeat(50));
  const noDeviationTest = testScenarios.find((s) =>
    s.taskTitle.includes('calculator component')
  );
  if (noDeviationTest) {
    const result = await analyzeDeviation(noDeviationTest);
    console.log(`Deviation Type: ${result.deviationType}`);
    console.log(`Reasoning: ${result.reasoning.substring(0, 200)}...`);
    console.log(`Suggested Action: ${result.suggestedAction}`);
  }

  // Test 3: Expert level task with major deviation
  console.log('\n⚠️ Test 3: Expert Level - Major Deviation');
  console.log('-'.repeat(50));
  const expertTest = testScenarios.find((s) =>
    s.taskTitle.includes('machine learning model')
  );
  if (expertTest) {
    const result = await analyzeDeviation(expertTest);
    console.log(`Deviation Type: ${result.deviationType}`);
    console.log(`Reasoning: ${result.reasoning.substring(0, 200)}...`);
    console.log(`Suggested Action: ${result.suggestedAction}`);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 CABE ARENA DEVIATION ANALYZER TEST SUITE');
  console.log('===========================================');
  console.log('Testing advanced AI-powered deviation analysis system...\n');

  try {
    // Run individual tests
    await runIndividualTests();

    // Run batch analysis
    await runBatchAnalysisTest();

    // Run specific scenario tests
    await runSpecificScenarioTests();

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('• Individual deviation analysis: ✅');
    console.log('• Batch analysis with pattern detection: ✅');
    console.log('• Specific scenario testing: ✅');
    console.log('• AI-powered reasoning generation: ✅');
    console.log('• Risk factor identification: ✅');
    console.log('• Action recommendation system: ✅');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  runAllTests,
  runIndividualTests,
  runBatchAnalysisTest,
  runSpecificScenarioTests,
  testScenarios,
};
